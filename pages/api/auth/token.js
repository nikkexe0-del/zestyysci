const tokenService = require('../../../lib/tokenService');

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  const { userId, role } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });
  try {
    const token = tokenService.generateApiToken(userId, role || 'user');
    res.json({ success: true, data: { token, expiresIn: '24h', userId, role: role || 'user' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
