// Simple in-memory cache (resets on cold starts, fine for Vercel edge)
const cache = new Map();
const cacheTTL = 600 * 1000; // 10 minutes in ms

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > cacheTTL) { cache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

const BASE_URL = process.env.BASE_API_URL || 'https://ABD.onrender.com';

async function fetchContent(courseId, parentId = null) {
  const cacheKey = `content_${courseId}_${parentId || 'root'}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  let url = `${BASE_URL}/api/scienceandfun/content?course_id=${courseId}`;
  if (parentId) url += `&parent_id=${parentId}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'ZestyyScii-Backend/1.0' },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`API responded with status: ${res.status}`);
  const json = await res.json();
  const data = json?.data || json || [];
  cacheSet(cacheKey, data);
  return data;
}

async function fetchBatches() {
  const cacheKey = 'batches';
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/api/scienceandfun/batches`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ZestyyScii-Backend/1.0' },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`API responded with status: ${res.status}`);
  const json = await res.json();
  const data = json?.data || json || [];
  cacheSet(cacheKey, data);
  return data;
}

function getBaseUrl() { return BASE_URL; }

module.exports = { fetchContent, fetchBatches, getBaseUrl };
