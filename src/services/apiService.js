import axios from 'axios';
import { buildVideoUrl, normalizeUrl, appendQueryParam } from '../utils/urlUtils';

// ============================================
// CENTRALIZED API CONFIGURATION
// API URL fetched from remote endpoint on first use
// ============================================

const API_URL_SOURCE = 'https://apiserver-all.vercel.app/api/scienceandfun/api-url';
const API_PATH_SUFFIX = '/api/scienceandfun';
const API_URL_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let BASE_URL = '';
let apiUrlCache = null;
let apiUrlCacheTime = 0;
// Single in-flight promise so concurrent callers share one fetch
let loadingPromise = null;

const loadApiUrlFromRemote = async () => {
  // Return cached value if still fresh
  if (apiUrlCache && Date.now() - apiUrlCacheTime < API_URL_CACHE_DURATION) {
    return apiUrlCache;
  }

  // Deduplicate concurrent requests
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const res = await fetch(API_URL_SOURCE, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json?.url) throw new Error('No url field in response');

      const rawUrl = json.url.replace(/\/$/, '');
      BASE_URL = rawUrl + API_PATH_SUFFIX;
      apiUrlCache = BASE_URL;
      apiUrlCacheTime = Date.now();
      console.log('✅ API Base URL loaded:', BASE_URL);
      return BASE_URL;
    } catch (error) {
      console.error('❌ Error loading API URL:', error.message);
      // Return stale cache if available rather than empty string
      return apiUrlCache || '';
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};

// Eagerly kick off URL fetch on module load (browser only)
if (typeof window !== 'undefined') {
  loadApiUrlFromRemote();
}

export const updateApiUrl = async (newUrl) => {
  if (!newUrl || typeof newUrl !== 'string') throw new Error('Invalid API URL');
  new URL(newUrl); // throws on invalid format
  BASE_URL = newUrl.trim();
  apiUrlCache = BASE_URL;
  apiUrlCacheTime = Date.now();
  console.log('✅ API Base URL updated in memory:', BASE_URL);
};

// Always resolves — awaits remote load if needed
export const getCurrentApiUrl = async () => {
  if (BASE_URL) return BASE_URL;
  return loadApiUrlFromRemote();
};

// ============================================
// API CLIENT & CACHE
// ============================================

const apiClient = axios.create({
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const responseCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

const getFromCache = (key) => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
  return null;
};

const saveToCache = (key, data) => {
  responseCache.set(key, { data, timestamp: Date.now() });
};

// ============================================
// SECURE FETCH — awaits URL before validating
// ============================================

const secureFetch = async (urlFn, useCache = true) => {
  // Ensure BASE_URL is loaded before doing anything
  const base = await getCurrentApiUrl();

  if (!base) {
    throw new Error('Unable to load content. Service temporarily unavailable.');
  }

  // urlFn receives the resolved base so callers don't need to pre-bake URLs
  const url = typeof urlFn === 'function' ? urlFn(base) : urlFn;

  if (useCache) {
    const cached = getFromCache(url);
    if (cached) return cached;
  }

  console.log('🔒 Secure API Request:', url);

  try {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    const response = await apiClient.get(proxyUrl);
    if (useCache) saveToCache(url, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Request Failed:', url, error.message);
    throw new Error('Unable to load content. Please try again later.');
  }
};

// ============================================
// API ENDPOINTS
// ============================================

export const getBatches = () =>
  secureFetch(base => `${base}/batches`);

export const getContentRoot = (batchId) =>
  secureFetch(base => `${base}/content?course_id=${batchId}`);

export const getFolderContent = (batchId, folderId) =>
  secureFetch(base => `${base}/content?course_id=${batchId}&parent_id=${folderId}`);

export const getVideoDetails = (videoId, batchId) =>
  secureFetch(base => `${base}/video-details?video_id=${videoId}&course_id=${batchId}`);

export const getLiveClasses = (batchId) =>
  secureFetch(base => `${base}/live?course_id=${batchId}`);

export const getPreviousLiveClasses = (batchId) =>
  secureFetch(base => `${base}/previous-live?course_id=${batchId}`);

export const getAttachmentUrl = (attachmentId, batchId) =>
  secureFetch(base => `${base}/attachment?id=${attachmentId}&course_id=${batchId}`);

export { buildVideoUrl, normalizeUrl, appendQueryParam };

// ============================================
// RECURSIVE BATCH CONTENT FETCHER
// ============================================

export const fetchAllBatchContent = async (batchId) => {
  const base = await getCurrentApiUrl();
  if (!base) throw new Error('API not configured');

  const rootResponse = await getContentRoot(batchId);
  const rootFolder = rootResponse.data?.find(item => item.material_type === 'FOLDER');
  if (!rootFolder) throw new Error('No root folder found for this batch');

  return fetchFolderRecursive(batchId, rootFolder.id);
};

const fetchFolderRecursive = async (batchId, folderId, accumulated = [], depth = 0) => {
  if (depth > 10) return accumulated;
  try {
    const response = await getFolderContent(batchId, folderId);
    const items = response.data || [];
    accumulated = [...accumulated, ...items];

    const subfolders = items.filter(i => i.material_type === 'FOLDER');
    if (subfolders.length > 0) {
      const subResults = await Promise.all(
        subfolders.map(f =>
          fetchFolderRecursive(batchId, f.id, [], depth + 1).catch(() => [])
        )
      );
      subResults.forEach(r => { accumulated = [...accumulated, ...r]; });
    }
    return accumulated;
  } catch {
    return accumulated;
  }
};
