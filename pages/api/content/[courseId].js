const { fetchContent } = require('../../../lib/apiService');
const tokenService = require('../../../lib/tokenService');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const { courseId, parent_id } = req.query;
  if (!courseId) return res.status(400).json({ success: false, message: 'Course ID is required' });

  try {
    const content = await fetchContent(courseId, parent_id || null);
    const processedContent = content.map(item => {
      const processed = {
        id: item.id,
        title: item.Title || item.title || item.name,
        type: item.material_type || item.type,
        parent_id: item.parent_id,
        created_at: item.created_at,
        thumbnail: item.video_thumbnail || item.thumbnail,
        duration: item.duration,
      };
      if (processed.type === 'PDF' && item.file_link) {
        const pdfToken = tokenService.generatePdfToken(item.id);
        processed.pdf_access_token = pdfToken;
        processed.pdf_url = `/api/pdf/${item.id}?token=${pdfToken}`;
      }
      if (processed.type === 'VIDEO') {
        processed.video_id = item.id;
        processed.has_pdf = !!item.file_link;
      }
      return processed;
    });
    res.json({ success: true, data: processedContent, count: processedContent.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
