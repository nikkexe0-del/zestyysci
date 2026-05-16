const { fetchBatches } = require('../../../lib/apiService');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    const batches = await fetchBatches();
    res.json({ success: true, data: batches, count: batches.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
