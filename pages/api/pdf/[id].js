const tokenService = require('../../../lib/tokenService');
const decryptionService = require('../../../lib/decryptionService');
const { fetchContent } = require('../../../lib/apiService');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const { id, token, course_id, parent_id, urlOnly } = req.query;

  if (!token) return res.status(401).json({ success: false, message: 'Access token is required' });

  try {
    const decoded = tokenService.verifyPdfToken(token);
    if (decoded.pdfId !== id) return res.status(403).json({ success: false, message: 'Token does not match PDF ID' });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }

  try {
    const content = await fetchContent(course_id, parent_id || null);
    const pdfItem = content.find(item => item.id === id);
    if (!pdfItem || !pdfItem.file_link) return res.status(404).json({ success: false, message: 'PDF not found' });

    const decryptedUrl = decryptionService.decryptPdfLink(pdfItem);
    if (!decryptedUrl || !decryptionService.isValidUrl(decryptedUrl)) {
      return res.status(500).json({ success: false, message: 'Failed to decrypt PDF link' });
    }

    if (urlOnly === '1') {
      return res.json({ success: true, data: { url: decryptedUrl, title: pdfItem.Title || pdfItem.title } });
    }

    const pdfRes = await fetch(decryptedUrl, { signal: AbortSignal.timeout(30000) });
    if (!pdfRes.ok) return res.redirect(decryptedUrl);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdfItem.Title || 'document'}.pdf"`);
    res.setHeader('Cache-Control', 'private, max-age=300');
    const buffer = await pdfRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
