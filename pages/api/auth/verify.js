const tokenService = require('../../../lib/tokenService');

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'Token is required' });
  try {
    const decoded = tokenService.verifyApiToken(token);
    res.json({ success: true, data: { valid: true, userId: decoded.userId, role: decoded.role } });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
}
