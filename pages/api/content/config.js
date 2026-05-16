const { getBaseUrl } = require('../../../lib/apiService');

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.json({ success: true, config: { baseUrl: getBaseUrl() } });
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
