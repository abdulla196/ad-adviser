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
export const AUTH_STORAGE_EVENT = 'ad-adviser-auth-updated';

const getStoredAuthToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adAdviserAuthToken') || '';
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adAdviserAuthToken');
  localStorage.removeItem('adAdviserUser');
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
};

const request = async (method, path, body = null, options = {}) => {
  const { auth: useAuth = false } = options;
  const requestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key':    API_KEY,
    },
  };

  if (useAuth) {
    const token = getStoredAuthToken();
    if (!token) {
      throw new Error('You need to log in first');
    }
    requestOptions.headers.Authorization = `Bearer ${token}`;
  }

  if (body) requestOptions.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, requestOptions);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
};

const get    = (path, options)       => request('GET',    path, null, options);
const post   = (path, body, options) => request('POST',  path, body, options);
const patch  = (path, body, options) => request('PATCH', path, body, options);
const del    = (path, options)       => request('DELETE', path, null, options);

// ── Auth / OAuth ──────────────────────────────────────
export const auth = {
  getStatus:      () => get('/api/auth/status', { auth: true }),
  registerBasic:  (payload) => post('/api/auth/register/basic', payload),
  loginBasic:     (payload) => post('/api/auth/login/basic', payload),
  registerGoogle: (payload) => post('/api/auth/register/google', payload),
  loginGoogle:    (payload) => post('/api/auth/login/google', payload),
  logout:         () => clearStoredAuth(),
  getMe:          () => get('/api/auth/me', { auth: true }),
  updateMe:       (payload) => patch('/api/auth/me', payload, { auth: true }),
  disconnect:     (platform) => del(`/api/auth/disconnect/${encodeURIComponent(platform)}`, { auth: true }),
  connectMeta:    () => {
    const token = getStoredAuthToken();
    if (!token) {
      throw new Error('You need to log in first');
    }
    const w = 600, h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    window.open(
      `${BASE_URL}/api/auth/meta/connect?token=${encodeURIComponent(token)}`,
      'meta_oauth',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`
    );
  },
  connectTikTok:  () => { window.location.href = `${BASE_URL}/api/auth/tiktok/connect`; },
  connectSnapchat:() => { window.location.href = `${BASE_URL}/api/auth/snapchat/connect`; },
  connectGoogle:  () => { window.location.href = `${BASE_URL}/api/auth/google/connect`; },
  getMetaPages:   () => get('/api/auth/meta/pages', { auth: true }),
  selectMetaPage: (payload) => post('/api/auth/meta/select-page', payload, { auth: true }),
  getMetaAdAccounts: (integrationId) => get(`/api/auth/meta/ad-accounts${integrationId ? `?integrationId=${encodeURIComponent(integrationId)}` : ''}`, { auth: true }),
  selectMetaAdAccount: (payload) => post('/api/auth/meta/select-ad-account', payload, { auth: true }),
  getMetaIntegrations: () => get('/api/auth/meta/integrations', { auth: true }),
  activateMetaIntegration: (integrationId) => post(`/api/auth/meta/integrations/${encodeURIComponent(integrationId)}/activate`, {}, { auth: true }),
  removeMetaIntegration: (integrationId) => del(`/api/auth/meta/integrations/${encodeURIComponent(integrationId)}`, { auth: true }),
};

// ── Meta ──────────────────────────────────────────────
export const meta = {
  getCampaigns:     (params = {}) => {
    const searchParams = new URLSearchParams();
    searchParams.set('status', params.status || 'ACTIVE');
    if (params.dateRange) searchParams.set('dateRange', params.dateRange);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    return get(`/api/meta/campaigns?${searchParams.toString()}`, { auth: true });
  },
  getCampaign:      (id)          => get(`/api/meta/campaigns/${encodeURIComponent(id)}`, { auth: true }),
  getAdSets:        (id)          => get(`/api/meta/campaigns/${encodeURIComponent(id)}/adsets`, { auth: true }),
  getAds:           (id)          => get(`/api/meta/campaigns/${encodeURIComponent(id)}/ads`, { auth: true }),
  createCampaign:   (data)        => post('/api/meta/campaigns', data, { auth: true }),
  updateCampaign:   (id, data)    => patch(`/api/meta/campaigns/${encodeURIComponent(id)}`, data, { auth: true }),
  pauseCampaign:    (id)          => patch(`/api/meta/campaigns/${encodeURIComponent(id)}/status`, { status: 'PAUSED' }, { auth: true }),
  activateCampaign: (id)          => patch(`/api/meta/campaigns/${encodeURIComponent(id)}/status`, { status: 'ACTIVE' }, { auth: true }),
  getPageAds:       (pageId)      => get(`/api/meta/pages/${encodeURIComponent(pageId)}/ads`, { auth: true }),
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
