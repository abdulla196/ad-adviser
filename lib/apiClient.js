const resolveBaseUrl = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_API_URL;
  const localUrl = process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:5000';
  const productionUrl = 'https://ad-adviser-backend-2t9i7h75z-abdulla196s-projects.vercel.app';

  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV !== 'production') {
    return localUrl.replace(/\/$/, '');
  }

  return productionUrl;
};

const BASE_URL = resolveBaseUrl();
const API_KEY  = process.env.NEXT_PUBLIC_API_KEY || '';

const request = async (method, path, body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key':    API_KEY,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
};

const get    = (path)       => request('GET',    path);
const post   = (path, body) => request('POST',  path, body);
const patch  = (path, body) => request('PATCH', path, body);
const del    = (path)       => request('DELETE', path);

// ── Auth / OAuth ──────────────────────────────────────
export const auth = {
  getStatus:      () => get('/api/auth/status'),
  disconnect:     (platform) => del(`/api/auth/disconnect/${encodeURIComponent(platform)}`),
  connectMeta:    () => {
    const w = 600, h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    window.open(
      `${BASE_URL}/api/auth/meta/connect`,
      'meta_oauth',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`
    );
  },
  connectTikTok:  () => { window.location.href = `${BASE_URL}/api/auth/tiktok/connect`; },
  connectSnapchat:() => { window.location.href = `${BASE_URL}/api/auth/snapchat/connect`; },
  connectGoogle:  () => { window.location.href = `${BASE_URL}/api/auth/google/connect`; },
  getMetaPages:   () => get('/api/auth/meta/pages'),
  selectMetaPage: (pageId, pageName) => post('/api/auth/meta/select-page', { pageId, pageName }),
  getMetaAdAccounts: () => get('/api/auth/meta/ad-accounts'),
  selectMetaAdAccount: (adAccountId, adAccountName) => post('/api/auth/meta/select-ad-account', { adAccountId, adAccountName }),
};

// ── Meta ──────────────────────────────────────────────
export const meta = {
  getCampaigns:     (params = {}) => {
    const searchParams = new URLSearchParams();
    searchParams.set('status', params.status || 'ACTIVE');
    if (params.dateRange) searchParams.set('dateRange', params.dateRange);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    return get(`/api/meta/campaigns?${searchParams.toString()}`);
  },
  getCampaign:      (id)          => get(`/api/meta/campaigns/${encodeURIComponent(id)}`),
  getAdSets:        (id)          => get(`/api/meta/campaigns/${encodeURIComponent(id)}/adsets`),
  getAds:           (id)          => get(`/api/meta/campaigns/${encodeURIComponent(id)}/ads`),
  createCampaign:   (data)        => post('/api/meta/campaigns', data),
  updateCampaign:   (id, data)    => patch(`/api/meta/campaigns/${encodeURIComponent(id)}`, data),
  pauseCampaign:    (id)          => patch(`/api/meta/campaigns/${encodeURIComponent(id)}/status`, { status: 'PAUSED' }),
  activateCampaign: (id)          => patch(`/api/meta/campaigns/${encodeURIComponent(id)}/status`, { status: 'ACTIVE' }),
  getPageAds:       (pageId)      => get(`/api/meta/pages/${encodeURIComponent(pageId)}/ads`),
};

// ── TikTok ────────────────────────────────────────────
export const tiktok = {
  getCampaigns:     (params = {}) => get(`/api/tiktok/campaigns?page=${params.page || 1}`),
  createCampaign:   (data)        => post('/api/tiktok/campaigns', data),
  updateCampaign:   (id, data)    => patch(`/api/tiktok/campaigns/${encodeURIComponent(id)}`, data),
  pauseCampaign:    (id)          => patch(`/api/tiktok/campaigns/${encodeURIComponent(id)}/status`, { status: 'DISABLE' }),
  activateCampaign: (id)          => patch(`/api/tiktok/campaigns/${encodeURIComponent(id)}/status`, { status: 'ENABLE' }),
};

// ── Snapchat ──────────────────────────────────────────
export const snapchat = {
  getCampaigns:     ()           => get('/api/snapchat/campaigns'),
  createCampaign:   (data)       => post('/api/snapchat/campaigns', data),
  updateCampaign:   (id, data)   => patch(`/api/snapchat/campaigns/${encodeURIComponent(id)}`, data),
  pauseCampaign:    (id)         => patch(`/api/snapchat/campaigns/${encodeURIComponent(id)}/status`, { status: 'PAUSED' }),
  activateCampaign: (id)         => patch(`/api/snapchat/campaigns/${encodeURIComponent(id)}/status`, { status: 'ACTIVE' }),
};

// ── Google ────────────────────────────────────────────
export const google = {
  getCampaigns:     (params = {}) => get(`/api/google/campaigns?startDate=${params.startDate || ''}&endDate=${params.endDate || ''}`),
  createCampaign:   (data)        => post('/api/google/campaigns', data),
  updateCampaign:   (id, data)    => patch(`/api/google/campaigns/${encodeURIComponent(id)}`, data),
  pauseCampaign:    (id)          => patch(`/api/google/campaigns/${encodeURIComponent(id)}/status`, { status: 'PAUSED' }),
  activateCampaign: (id)          => patch(`/api/google/campaigns/${encodeURIComponent(id)}/status`, { status: 'ENABLED' }),
};

// ── Unified ───────────────────────────────────────────
export const unified = {
  getCampaigns: (platforms) => {
    const qs = platforms ? `?platforms=${platforms.join(',')}` : '';
    return get(`/api/unified/campaigns${qs}`);
  },
};

const api = { auth, meta, tiktok, snapchat, google, unified };
export default api;
