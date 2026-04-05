'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, meta as metaApi } from '../../../lib/apiClient';

/* Types */
type PlatformStatus = {
  connected: boolean;
  connectedAt?: string;
  selectedPageId?: string | null;
  selectedPageName?: string | null;
  selectedAdAccountId?: string | null;
  selectedAdAccountName?: string | null;
};

type MetaPage = {
  id: string;
  name: string;
  category?: string;
  picture?: { data?: { url?: string } };
};

type AdAccount = {
  id: string;
  name: string;
  account_status?: number;
  currency?: string;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
  effectiveStatus?: string;
  objective: string;
  budget: number;
  lifetimeBudget?: number;
  budgetRemaining?: number;
  budgetType?: string;
  buyingType?: string;
  impressions: number;
  reach?: number;
  clicks: number;
  spend: number;
  revenue?: number;
  ctr: number;
  cpc: number;
  cpm?: number;
  conversions: number;
  leads?: number;
  purchases?: number;
  viewContent?: number;
  addToCart?: number;
  initiateCheckout?: number;
  cpl?: number;
  cpa?: number;
  aov?: number;
  roas: number;
  startDate?: string;
  endDate?: string;
  lastUpdated?: string;
  recommendationsCount?: number;
};

type DetailTab = 'all' | 'campaigns' | 'adsets' | 'ads';
type MetricMode = 'sales' | 'leads' | 'both';

type AdSet = {
  id: string;
  name: string;
  status: string;
  effectiveStatus: string;
  optimizationGoal: string;
  billingEvent: string;
  budget: number;
  lifetimeBudget: number;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  purchases: number;
};

type Ad = {
  id: string;
  name: string;
  status: string;
  effectiveStatus: string;
  adsetName: string;
  creativeTitle: string;
  creativeBody: string;
  thumbnailUrl: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  leads: number;
  purchases: number;
  revenue: number;
  roas: number;
};

const INTEGER_FORMATTER = new Intl.NumberFormat('en-US');
const DECIMAL_FORMATTER = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const DATE_PRESET_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: 'Last 7 days' },
  { id: '14d', label: 'Last 14 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'this_week', label: 'This week' },
  { id: 'last_week', label: 'Last week' },
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'maximum', label: 'Maximum' },
  { id: 'custom', label: 'Custom range' },
] as const;

const toInputDate = (date: Date) => {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 10);
};

const fromInputDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const startOfWeek = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfWeek = (date: Date) => {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  return next;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const resolveDatePreset = (preset: string, customStartDate?: string, customEndDate?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return { startDate: toInputDate(today), endDate: toInputDate(today), dateRange: undefined };
    case 'yesterday': {
      const yesterday = addDays(today, -1);
      return { startDate: toInputDate(yesterday), endDate: toInputDate(yesterday), dateRange: undefined };
    }
    case '7d':
      return { startDate: undefined, endDate: undefined, dateRange: '7d' };
    case '14d':
      return { startDate: undefined, endDate: undefined, dateRange: '14d' };
    case '30d':
      return { startDate: undefined, endDate: undefined, dateRange: '30d' };
    case '90d':
      return { startDate: undefined, endDate: undefined, dateRange: '90d' };
    case 'this_week': {
      const startDate = startOfWeek(today);
      return { startDate: toInputDate(startDate), endDate: toInputDate(today), dateRange: undefined };
    }
    case 'last_week': {
      const reference = addDays(today, -7);
      return { startDate: toInputDate(startOfWeek(reference)), endDate: toInputDate(endOfWeek(reference)), dateRange: undefined };
    }
    case 'this_month':
      return { startDate: toInputDate(startOfMonth(today)), endDate: toInputDate(today), dateRange: undefined };
    case 'last_month': {
      const reference = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return { startDate: toInputDate(startOfMonth(reference)), endDate: toInputDate(endOfMonth(reference)), dateRange: undefined };
    }
    case 'maximum':
      return { startDate: '2020-01-01', endDate: toInputDate(today), dateRange: undefined };
    case 'custom':
      return { startDate: customStartDate, endDate: customEndDate, dateRange: undefined };
    default:
      return { startDate: undefined, endDate: undefined, dateRange: '30d' };
  }
};

const getDateRangeLabel = (preset: string, startDate?: string, endDate?: string) => {
  if (startDate && endDate) {
    return `Last 30 days: ${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
  }

  const presetLabel = DATE_PRESET_OPTIONS.find((option) => option.id === preset)?.label || 'Last 30 days';
  return presetLabel;
};

const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sumActions = (items: Array<{ action_type?: string; value?: string | number }> | undefined, actionTypes: string[]) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    if (!item?.action_type || !actionTypes.includes(item.action_type)) return total;
    return total + safeNumber(item.value);
  }, 0);
};

const cleanStatus = (value?: string) => String(value || '').replace(/\s+/g, '').toUpperCase() || 'UNKNOWN';
const cleanText = (value?: string) => String(value || '').replace(/\s+/g, ' ').trim();

const formatCurrency = (value: number, currency = 'USD') => {
  const upperCurrency = currency.toUpperCase();
  return `${upperCurrency}${DECIMAL_FORMATTER.format(safeNumber(value))}`;
};

const formatInteger = (value: number) => INTEGER_FORMATTER.format(safeNumber(value));
const formatPercent = (value: number) => `${DECIMAL_FORMATTER.format(safeNumber(value))}%`;
const formatMultiple = (value: number) => `${DECIMAL_FORMATTER.format(safeNumber(value))}x`;

const formatShortNumber = (value: number) => {
  const absolute = Math.abs(safeNumber(value));
  if (absolute >= 1_000_000) return `${DECIMAL_FORMATTER.format(value / 1_000_000)}M`;
  if (absolute >= 1_000) return `${DECIMAL_FORMATTER.format(value / 1_000)}K`;
  return formatInteger(value);
};

const formatDateLabel = (value?: string) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return DATE_FORMATTER.format(date);
};

const formatRelativeAge = (value?: string) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  const diffMs = Date.now() - date.getTime();
  const days = Math.max(0, Math.floor(diffMs / 86400000));
  if (days < 1) return 'Today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

const formatDuration = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) return 'Always on';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Unknown';
  const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  return `${diffDays} day${diffDays === 1 ? '' : 's'} active`;
};

const statusTone = (status: string) => {
  if (status === 'ACTIVE') return { bg: 'rgba(34,197,94,0.14)', color: '#22c55e' };
  if (status === 'PAUSED') return { bg: 'rgba(148,163,184,0.14)', color: '#94a3b8' };
  return { bg: 'rgba(249,115,22,0.14)', color: '#f97316' };
};

const mapCampaign = (campaign: any): Campaign => ({
  id: String(campaign.id || ''),
  name: cleanText(campaign.name),
  status: cleanStatus(campaign.status || campaign.effectiveStatus),
  effectiveStatus: cleanStatus(campaign.effectiveStatus || campaign.status),
  objective: cleanText(campaign.objective) || 'Unknown',
  budget: safeNumber(campaign.budget),
  lifetimeBudget: safeNumber(campaign.lifetimeBudget),
  budgetRemaining: safeNumber(campaign.budgetRemaining),
  budgetType: cleanText(campaign.budgetType) || 'Budget',
  buyingType: cleanText(campaign.buyingType),
  impressions: safeNumber(campaign.impressions),
  reach: safeNumber(campaign.reach),
  clicks: safeNumber(campaign.clicks),
  spend: safeNumber(campaign.spend),
  revenue: safeNumber(campaign.revenue),
  ctr: safeNumber(campaign.ctr),
  cpc: safeNumber(campaign.cpc),
  cpm: safeNumber(campaign.cpm),
  conversions: safeNumber(campaign.conversions),
  leads: safeNumber(campaign.leads),
  purchases: safeNumber(campaign.purchases || campaign.conversions),
  viewContent: safeNumber(campaign.viewContent),
  addToCart: safeNumber(campaign.addToCart),
  initiateCheckout: safeNumber(campaign.initiateCheckout),
  cpl: safeNumber(campaign.cpl),
  cpa: safeNumber(campaign.cpa),
  aov: safeNumber(campaign.aov),
  roas: safeNumber(campaign.roas),
  startDate: campaign.startDate || '',
  endDate: campaign.endDate || '',
  lastUpdated: campaign.lastUpdated || '',
  recommendationsCount: safeNumber(campaign.recommendationsCount),
});

const mapAdSet = (adSet: any): AdSet => {
  const insights = adSet.insights?.data?.[0] || {};
  return {
    id: String(adSet.id || ''),
    name: cleanText(adSet.name),
    status: cleanStatus(adSet.status),
    effectiveStatus: cleanStatus(adSet.effective_status || adSet.status),
    optimizationGoal: cleanText(adSet.optimization_goal) || 'Unknown',
    billingEvent: cleanText(adSet.billing_event) || 'Unknown',
    budget: safeNumber(adSet.daily_budget) / 100,
    lifetimeBudget: safeNumber(adSet.lifetime_budget) / 100,
    impressions: safeNumber(insights.impressions),
    reach: safeNumber(insights.reach),
    clicks: safeNumber(insights.clicks),
    spend: safeNumber(insights.spend),
    ctr: safeNumber(insights.ctr),
    cpc: safeNumber(insights.cpc),
    cpm: safeNumber(insights.cpm),
    leads: sumActions(insights.actions, ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead']),
    purchases: sumActions(insights.actions, ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase']),
  };
};

const mapAd = (ad: any): Ad => {
  const insights = ad.insights?.data?.[0] || {};
  const purchases = sumActions(insights.actions, ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase']);
  const revenue = sumActions(insights.action_values, ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase']);
  const spend = safeNumber(insights.spend);
  return {
    id: String(ad.id || ''),
    name: cleanText(ad.name),
    status: cleanStatus(ad.status),
    effectiveStatus: cleanStatus(ad.effective_status || ad.status),
    adsetName: cleanText(ad.adset?.name) || 'Unknown ad set',
    creativeTitle: cleanText(ad.creative?.title || ad.creative?.name),
    creativeBody: cleanText(ad.creative?.body || ad.creative?.object_story_spec?.link_data?.message),
    thumbnailUrl: String(ad.creative?.thumbnail_url || ad.creative?.image_url || ''),
    impressions: safeNumber(insights.impressions),
    reach: safeNumber(insights.reach),
    clicks: safeNumber(insights.clicks),
    spend,
    ctr: safeNumber(insights.ctr),
    cpc: safeNumber(insights.cpc),
    cpm: safeNumber(insights.cpm),
    leads: sumActions(insights.actions, ['lead', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead']),
    purchases,
    revenue,
    roas: safeNumber(insights.purchase_roas?.[0]?.value) || (spend > 0 ? revenue / spend : 0),
  };
};

/* Step indicator */
const STEPS = ['Connect Meta', 'Select Page', 'Select Ad Account', 'Manage Ads'];

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36 }}>
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--bg3)',
                border: `2px solid ${done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                color: (done || active) ? '#fff' : 'var(--muted)',
                transition: 'all 0.3s',
                boxShadow: active ? '0 0 16px rgba(124,106,247,0.4)' : 'none',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 11, fontWeight: active ? 600 : 400, textAlign: 'center', lineHeight: 1.3,
                color: active ? 'var(--text)' : done ? 'var(--green)' : 'var(--muted)',
                whiteSpace: 'nowrap',
              }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 20, marginBottom: 22,
                background: done ? 'var(--green)' : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Step 0 - Connect */
function ConnectStep({ onConnected }: { onConnected: () => void }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    auth.connectMeta();
  };

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'META_OAUTH_SUCCESS') { setConnecting(false); onConnected(); }
      if (e.data?.type === 'META_OAUTH_ERROR')   { setConnecting(false); }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onConnected]);

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: '16px 0 36px' }}>
      <div style={{
        width: 76, height: 76, borderRadius: 20, background: '#1877F2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', fontSize: 34, fontWeight: 800, color: '#fff',
        fontFamily: 'Syne, sans-serif', boxShadow: '0 8px 32px rgba(24,119,242,0.35)',
      }}>f</div>

      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
        Connect your Meta account
      </h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
        Log in with your Facebook account to grant Ad Adviser access to your Meta Ads.
        We only request the minimum permissions needed to view and manage campaigns.
      </p>

      {/* Permissions list */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 18px', marginBottom: 28, textAlign: 'left',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Permissions requested
        </div>
        {[
          ['📋', 'ads_read', 'View campaigns, ad sets, and ads'],
          ['✏️', 'ads_management', 'Create and update campaigns'],
          ['📄', 'pages_show_list', 'See the Facebook Pages you manage'],
          ['👤', 'public_profile', 'Read your basic profile info'],
        ].map(([icon, perm, desc]) => (
          <div key={perm as string} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>{icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent2)', fontFamily: 'monospace' }}>{perm}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>- {desc}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleConnect}
        disabled={connecting}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 28px',
          borderRadius: 999, border: 'none',
          background: connecting ? 'var(--bg3)' : '#1877F2',
          color: '#fff', fontSize: 15, fontWeight: 700, cursor: connecting ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', boxShadow: connecting ? 'none' : '0 4px 20px rgba(24,119,242,0.38)',
          fontFamily: 'Syne, sans-serif',
        }}
      >
        {connecting ? (
          <>
            <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'mspin 0.7s linear infinite' }} />
            Waiting for login…
          </>
        ) : (
          <>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Continue with Facebook
          </>
        )}
      </button>
      <p style={{ marginTop: 14, fontSize: 11, color: 'var(--muted)' }}>
        A popup will open. Make sure your browser allows popups for this site.
      </p>
      <style>{`@keyframes mspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* Step 1 - Select Page */
function SelectPageStep({ onSelect, onSkip }: { onSelect: (page: MetaPage) => void; onSkip: () => void }) {
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [userInfo, setUserInfo] = useState<{ name?: string; picture?: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await auth.getMetaPages();
        setPages(data.pages || []);
        if (data.user) setUserInfo({ name: data.user.name, picture: data.user.picture?.data?.url });
      } catch { setPages([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = query.trim()
    ? pages.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.includes(query))
    : pages;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {userInfo && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
          background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 10, marginBottom: 22,
        }}>
          {userInfo.picture && <img src={userInfo.picture} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              Logged in as <span style={{ color: 'var(--green)' }}>{userInfo.name}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Facebook account connected</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>Connected</span>
          </div>
        </div>
      )}

      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 21, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
        Select a Facebook Page
      </h2>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
        Choose the Facebook Page associated with the ad account you want to manage.
      </p>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search pages…"
          style={{ width: '100%', padding: '10px 14px 10px 34px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          <div style={{ width: 26, height: 26, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'mspin 0.7s linear infinite', margin: '0 auto 12px' }} />
          Loading your Facebook pages…
          <style>{`@keyframes mspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            {query ? 'No pages match your search' : 'No Facebook Pages found'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
            {query ? 'Try clearing the search filter.' : 'Your account must be an admin of at least one Facebook Page.'}
          </div>
          <button onClick={onSkip} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
            Skip - go to ad account selection
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(page => (
            <button key={page.id} onClick={() => onSelect(page)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
            >
              {page.picture?.data?.url
                ? <img src={page.picture.data.url} alt={page.name} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 700, flexShrink: 0 }}>{page.name.charAt(0).toUpperCase()}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>ID: {page.id}{page.category ? ` · ${page.category}` : ''}</div>
              </div>
              <span style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(124,106,247,0.12)', color: 'var(--accent2)', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>Select →</span>
            </button>
          ))}
        </div>
      )}
      {filtered.length > 0 && (
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <button onClick={onSkip} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Skip page selection
          </button>
        </div>
      )}
    </div>
  );
}

/* Step 2 - Select Ad Account */
function SelectAdAccountStep({
  selectedPage,
  onSelect,
  onBack,
}: {
  selectedPage: MetaPage | null;
  onSelect: (account: AdAccount) => void;
  onBack: () => void;
}) {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await auth.getMetaAdAccounts();
        setAccounts(data.adAccounts || []);
      } catch { setAccounts([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = query.trim()
    ? accounts.filter(a => a.name.toLowerCase().includes(query.toLowerCase()) || a.id.includes(query))
    : accounts;

  const statusInfo = (s?: number): [string, string] => {
    const map: Record<number, [string, string]> = {
      1: ['Active', 'var(--green)'], 2: ['Disabled', 'var(--red)'],
      3: ['Unsettled', '#f59e0b'], 7: ['Pending Review', '#f59e0b'],
      9: ['Grace Period', '#f59e0b'], 100: ['Pending Closure', 'var(--muted)'],
      101: ['Closed', 'var(--muted)'],
    };
    return map[s ?? 0] ?? ['Unknown', 'var(--muted)'];
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {selectedPage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.2)', borderRadius: 10, marginBottom: 22, fontSize: 13 }}>
          {selectedPage.picture?.data?.url
            ? <img src={selectedPage.picture.data.url} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
            : <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{selectedPage.name.charAt(0)}</div>
          }
          <span style={{ color: 'var(--muted)' }}>Page:</span>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{selectedPage.name}</span>
        </div>
      )}

      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 21, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
        Select an Ad Account
      </h2>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
        Choose the Meta ad account you want to manage campaigns for.
      </p>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ad accounts…"
          style={{ width: '100%', padding: '10px 14px 10px 34px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          <div style={{ width: 26, height: 26, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'mspin 0.7s linear infinite', margin: '0 auto 12px' }} />
          Loading ad accounts…
          <style>{`@keyframes mspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>💳</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            {query ? 'No accounts match' : 'No ad accounts found'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {query ? 'Try clearing the search.' : <>Ensure your account has access to a Meta Ads account with <code style={{ color: 'var(--accent2)' }}>ads_read</code> permission.</>}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(account => {
            const [statusText, statusColor] = statusInfo(account.account_status);
            return (
              <button key={account.id} onClick={() => onSelect(account)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 11, background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>M</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{account.id}{account.currency ? ` · ${account.currency}` : ''}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, background: `${statusColor}1a`, padding: '3px 8px', borderRadius: 999 }}>{statusText}</span>
                  <span style={{ fontSize: 11, color: 'var(--accent2)', fontWeight: 600 }}>Select →</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 18 }}>
        <button onClick={onBack} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back to page selection</button>
      </div>
    </div>
  );
}

/* Step 3 - Manage Ads */
function ManageAdsStep({
  selectedPage,
  selectedAccount,
  onReset,
}: {
  selectedPage: MetaPage | null;
  selectedAccount: AdAccount | null;
  onReset: () => void;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'PAUSED' | 'ALL'>('ACTIVE');
  const [objectiveFilter, setObjectiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<Campaign | null>(null);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('all');
  const [metricMode, setMetricMode] = useState<MetricMode>('both');
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [pendingDatePreset, setPendingDatePreset] = useState('30d');
  const [appliedDatePreset, setAppliedDatePreset] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState<string | undefined>(undefined);
  const [appliedEndDate, setAppliedEndDate] = useState<string | undefined>(undefined);

  const currency = selectedAccount?.currency || 'USD';
  const listTableHeight = 'clamp(320px, calc(100vh - 430px), 620px)';
  const detailPanelHeight = 'clamp(560px, calc(100vh - 240px), 900px)';

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter === 'ALL' ? 'ACTIVE,PAUSED' : statusFilter;
      const response = await (metaApi as any).getCampaigns({
        status: statusParam,
        dateRange: appliedDatePreset === 'custom' ? undefined : resolveDatePreset(appliedDatePreset).dateRange,
        startDate: appliedStartDate,
        endDate: appliedEndDate,
      });
      const rows = (response?.data || response || []).map(mapCampaign);
      setCampaigns(rows);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, appliedDatePreset, appliedStartDate, appliedEndDate]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const objectives = useMemo(() => {
    return Array.from(new Set(campaigns.map((campaign) => campaign.objective).filter(Boolean))).sort();
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesQuery = !query
        || campaign.name.toLowerCase().includes(query)
        || campaign.id.toLowerCase().includes(query);
      const matchesObjective = objectiveFilter === 'ALL' || campaign.objective === objectiveFilter;
      return matchesQuery && matchesObjective;
    });
  }, [campaigns, searchQuery, objectiveFilter]);

  const totalSpend = filteredCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
  const totalRevenue = filteredCampaigns.reduce((sum, campaign) => sum + safeNumber(campaign.revenue), 0);
  const totalLeads = filteredCampaigns.reduce((sum, campaign) => sum + safeNumber(campaign.leads), 0);
  const totalImpressions = filteredCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const totalClicks = filteredCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);

  const loadCampaignDetails = useCallback(async (campaignId: string) => {
    setDetailLoading(true);
    setSelectedCampaignId(campaignId);
    setDetailTab('all');
    try {
      const [campaignResponse, adSetResponse, adResponse] = await Promise.all([
        (metaApi as any).getCampaign(campaignId),
        (metaApi as any).getAdSets(campaignId),
        (metaApi as any).getAds(campaignId),
      ]);
      setCampaignDetail(mapCampaign(campaignResponse?.data || campaignResponse));
      setAdSets((adSetResponse?.data || adSetResponse || []).map(mapAdSet));
      setAds((adResponse?.data || adResponse || []).map(mapAd));
    } catch {
      setCampaignDetail(null);
      setAdSets([]);
      setAds([]);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const toggleStatus = async (campaign: Campaign) => {
    setTogglingId(campaign.id);
    try {
      if (campaign.status === 'ACTIVE') {
        await (metaApi as any).pauseCampaign(campaign.id);
      } else {
        await (metaApi as any).activateCampaign(campaign.id);
      }
      await loadCampaigns();
      if (selectedCampaignId === campaign.id) {
        await loadCampaignDetails(campaign.id);
      }
    } catch {
      // Keep the current state if the update fails.
    } finally {
      setTogglingId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    const tone = statusTone(status);
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 999,
        background: tone.bg,
        color: tone.color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone.color }} />
        {status}
      </span>
    );
  };

  const applyDateFilter = () => {
    const resolved = resolveDatePreset(pendingDatePreset, customStartDate, customEndDate);
    setAppliedDatePreset(pendingDatePreset);
    setAppliedStartDate(resolved.startDate);
    setAppliedEndDate(resolved.endDate);
    setDatePopoverOpen(false);
  };

  const showSalesColumns = metricMode !== 'leads';
  const showLeadColumns = metricMode !== 'sales';

  const stickyColumnStyle = {
    position: 'sticky' as const,
    left: 0,
    zIndex: 2,
    background: 'var(--bg3)',
    boxShadow: '10px 0 18px rgba(9, 12, 18, 0.18)',
  };

  const stickyFooterStyle = {
    position: 'sticky' as const,
    bottom: 0,
    zIndex: 5,
    background: 'rgb(42, 50, 66)',
    boxShadow: '0 -10px 24px rgba(9, 12, 18, 0.18)',
  };

  const renderListView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        padding: '14px 16px', background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 14, marginBottom: 18,
      }}>
        {selectedPage && (
          <>
            {selectedPage.picture?.data?.url
              ? <img src={selectedPage.picture.data.url} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{selectedPage.name.charAt(0)}</div>
            }
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{selectedPage.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Facebook Page</div>
            </div>
          </>
        )}
        {selectedAccount && (
          <>
            <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>M</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{selectedAccount.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{selectedAccount.id}{selectedAccount.currency ? ` · ${selectedAccount.currency}` : ''}</div>
            </div>
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={onReset} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>
            Switch Account
          </button>
          <button onClick={loadCampaigns} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search campaigns..."
              style={{
                minWidth: 240,
                flex: '1 1 240px',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['ACTIVE', 'PAUSED', 'ALL'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: statusFilter === value ? 'none' : '1px solid var(--border)',
                    background: statusFilter === value ? '#111827' : 'var(--bg2)',
                    color: statusFilter === value ? '#fff' : 'var(--muted)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {value === 'ALL' ? 'All' : value === 'ACTIVE' ? 'Active' : 'Paused'}
                </button>
              ))}
            </div>
            <select
              value={objectiveFilter}
              onChange={(event) => setObjectiveFilter(event.target.value)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg2)',
                color: 'var(--text)',
                fontSize: 12,
                outline: 'none',
              }}
            >
              <option value="ALL">Objective: All</option>
              {objectives.map((objective) => (
                <option key={objective} value={objective}>{objective}</option>
              ))}
            </select>
            <button style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 10, border: 'none', background: '#6b7280', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Generate
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Metrics</span>
              {[
                { id: 'sales', label: 'Sales', dot: '#22c55e' },
                { id: 'leads', label: 'Leads', dot: '#f97316' },
                { id: 'both', label: 'Both', dot: null },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMetricMode(item.id as MetricMode)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: metricMode === item.id ? '1px solid rgba(37,99,235,0.3)' : '1px solid var(--border)',
                    background: metricMode === item.id ? 'rgba(37,99,235,0.08)' : 'var(--bg2)',
                    fontSize: 11,
                    color: metricMode === item.id ? '#2563eb' : 'var(--muted)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {item.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.dot }} />}
                  {item.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDatePopoverOpen((value) => !value)}
                style={{ padding: '7px 12px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--bg2)', fontSize: 11, color: 'var(--text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <span style={{ fontSize: 13 }}>📅</span>
                {getDateRangeLabel(appliedDatePreset, appliedStartDate, appliedEndDate)}
                <span style={{ color: 'var(--muted)' }}>⌄</span>
              </button>
              {datePopoverOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 720, maxWidth: 'calc(100vw - 80px)', background: '#fff', color: '#0f172a', borderRadius: 18, border: '1px solid #e5e7eb', boxShadow: '0 24px 80px rgba(15,23,42,0.18)', zIndex: 30, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                    <div style={{ borderRight: '1px solid #e5e7eb', padding: 16, maxHeight: 420, overflowY: 'auto' }}>
                      {DATE_PRESET_OPTIONS.map((option) => (
                        <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', fontSize: 14, cursor: 'pointer' }}>
                          <input type="radio" name="date-preset" checked={pendingDatePreset === option.id} onChange={() => setPendingDatePreset(option.id)} />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    <div style={{ padding: 18 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <strong>Start date</strong>
                            <span style={{ color: '#64748b', fontSize: 12 }}>{customStartDate ? formatDateLabel(customStartDate) : 'Not set'}</span>
                          </div>
                          <input type="date" value={customStartDate} onChange={(event) => { setCustomStartDate(event.target.value); setPendingDatePreset('custom'); }} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #dbe4f0', fontSize: 14 }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <strong>End date</strong>
                            <span style={{ color: '#64748b', fontSize: 12 }}>{customEndDate ? formatDateLabel(customEndDate) : 'Not set'}</span>
                          </div>
                          <input type="date" value={customEndDate} onChange={(event) => { setCustomEndDate(event.target.value); setPendingDatePreset('custom'); }} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #dbe4f0', fontSize: 14 }} />
                        </div>
                      </div>
                      {customStartDate && customEndDate && pendingDatePreset === 'custom' && (
                        <div style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>
                          Dates are shown in Africa/Cairo
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button onClick={() => setDatePopoverOpen(false)} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #dbe4f0', background: '#fff', color: '#334155', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                        <button onClick={applyDateFilter} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#0f172a', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Update</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
          Results from <strong style={{ color: 'var(--text)' }}>{filteredCampaigns.length}</strong> campaigns
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--muted)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 30, height: 30, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'mspin 0.7s linear infinite', margin: '0 auto 12px' }} />
            Loading Meta campaigns...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--muted)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No campaigns matched your current filters.
          </div>
        ) : (
          <div style={{ height: listTableHeight, overflowX: 'auto', overflowY: 'auto', overscrollBehavior: 'contain' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1750 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ ...stickyColumnStyle, top: 0, zIndex: 4, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>Campaign</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Recommendations</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Status</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Daily Budget</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Spend</th>
                  {showSalesColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Revenue</th>}
                  {showSalesColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>ROAS</th>}
                  {showLeadColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>CPA</th>}
                  {showSalesColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>AOV</th>}
                  {showLeadColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Leads</th>}
                  {showLeadColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>CPL</th>}
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Impressions</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Clicks</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>CTR</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>CPC</th>
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>CPM</th>
                  {showSalesColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>View Content</th>}
                  {showSalesColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Add to Cart</th>}
                  {showSalesColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Init. Checkout</th>}
                  {showSalesColumns && <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Purchases</th>}
                  <th style={{ position: 'sticky', top: 0, zIndex: 3, padding: '12px 14px', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', whiteSpace: 'nowrap', background: 'rgb(24, 28, 39)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign, index) => (
                  <tr
                    key={campaign.id}
                    style={{ borderBottom: '1px solid var(--border)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                  >
                    <td style={{ ...stickyColumnStyle, padding: '14px', minWidth: 320, background: index % 2 === 0 ? 'var(--bg3)' : 'rgb(28, 32, 44)' }}>
                      <button
                        onClick={() => loadCampaignDetails(campaign.id)}
                        style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', color: '#2563eb', maxWidth: '100%' }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campaign.name}</div>
                      </button>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>ID: {campaign.id}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Objective: {campaign.objective} · {formatDuration(campaign.startDate, campaign.endDate)}</div>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>{safeNumber(campaign.recommendationsCount)}</td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>{renderStatusBadge(campaign.effectiveStatus || campaign.status)}</td>
                    <td style={{ padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                      {formatCurrency(campaign.budget, currency)}
                      <div style={{ fontSize: 10, color: '#2563eb', marginTop: 4 }}>{campaign.budgetType || 'Budget'}</div>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatCurrency(campaign.spend, currency)}</td>
                    {showSalesColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatCurrency(safeNumber(campaign.revenue), currency)}</td>}
                    {showSalesColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12, color: '#ef4444' }}>{formatMultiple(campaign.roas)}</td>}
                    {showLeadColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatCurrency(safeNumber(campaign.cpa), currency)}</td>}
                    {showSalesColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatCurrency(safeNumber(campaign.aov), currency)}</td>}
                    {showLeadColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatInteger(safeNumber(campaign.leads))}</td>}
                    {showLeadColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12, color: '#22c55e' }}>{formatCurrency(safeNumber(campaign.cpl), currency)}</td>}
                    <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatInteger(campaign.impressions)}</td>
                    <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatInteger(campaign.clicks)}</td>
                    <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatPercent(campaign.ctr)}</td>
                    <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatCurrency(campaign.cpc, currency)}</td>
                    <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatCurrency(safeNumber(campaign.cpm), currency)}</td>
                    {showSalesColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatInteger(safeNumber(campaign.viewContent))}</td>}
                    {showSalesColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatInteger(safeNumber(campaign.addToCart))}</td>}
                    {showSalesColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatInteger(safeNumber(campaign.initiateCheckout))}</td>}
                    {showSalesColumns && <td style={{ padding: '14px', textAlign: 'right', fontSize: 12 }}>{formatInteger(safeNumber(campaign.purchases))}</td>}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => loadCampaignDetails(campaign.id)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontSize: 11, cursor: 'pointer' }}>
                          Details
                        </button>
                        <button
                          onClick={() => toggleStatus(campaign)}
                          disabled={togglingId === campaign.id}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 8,
                            border: `1px solid ${campaign.status === 'ACTIVE' ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'}`,
                            background: 'transparent',
                            color: campaign.status === 'ACTIVE' ? '#ef4444' : '#22c55e',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: togglingId === campaign.id ? 'wait' : 'pointer',
                          }}
                        >
                          {togglingId === campaign.id ? '...' : campaign.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(148,163,184,0.12)', borderTop: '1px solid var(--border)' }}>
                  <td style={{ ...stickyColumnStyle, ...stickyFooterStyle, left: 0, padding: '14px', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Total</td>
                  <td style={{ ...stickyFooterStyle, padding: '14px' }} />
                  <td style={{ ...stickyFooterStyle, padding: '14px' }} />
                  <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatCurrency(filteredCampaigns.reduce((sum, campaign) => sum + campaign.budget, 0), currency)}</td>
                  <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatCurrency(totalSpend, currency)}</td>
                  {showSalesColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatCurrency(totalRevenue, currency)}</td>}
                  {showSalesColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatMultiple(totalSpend > 0 ? totalRevenue / totalSpend : 0)}</td>}
                  {showLeadColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatCurrency(filteredCampaigns.reduce((sum, campaign) => sum + safeNumber(campaign.cpa), 0), currency)}</td>}
                  {showSalesColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatCurrency(filteredCampaigns.reduce((sum, campaign) => sum + safeNumber(campaign.aov), 0), currency)}</td>}
                  {showLeadColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatInteger(totalLeads)}</td>}
                  {showLeadColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatCurrency(totalLeads > 0 ? totalSpend / totalLeads : 0, currency)}</td>}
                  <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatInteger(totalImpressions)}</td>
                  <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatInteger(totalClicks)}</td>
                  <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatPercent(totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0)}</td>
                  <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatCurrency(totalClicks > 0 ? totalSpend / totalClicks : 0, currency)}</td>
                  <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatCurrency(totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0, currency)}</td>
                  {showSalesColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatInteger(filteredCampaigns.reduce((sum, campaign) => sum + safeNumber(campaign.viewContent), 0))}</td>}
                  {showSalesColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatInteger(filteredCampaigns.reduce((sum, campaign) => sum + safeNumber(campaign.addToCart), 0))}</td>}
                  {showSalesColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatInteger(filteredCampaigns.reduce((sum, campaign) => sum + safeNumber(campaign.initiateCheckout), 0))}</td>}
                  {showSalesColumns && <td style={{ ...stickyFooterStyle, padding: '14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{formatInteger(filteredCampaigns.reduce((sum, campaign) => sum + safeNumber(campaign.purchases), 0))}</td>}
                  <td style={{ ...stickyFooterStyle, padding: '14px' }} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes mspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const renderDetailTable = (headers: string[], rows: Array<Array<string | number | JSX.Element>>) => (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ maxHeight: '58vh', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
              {headers.map((header, index) => (
                <th key={header} style={{ position: 'sticky', top: 0, zIndex: 1, padding: '12px 14px', textAlign: index === 0 ? 'left' : 'right', fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', background: '#f8fafc' }}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ borderBottom: rowIndex < rows.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} style={{ padding: '14px', textAlign: cellIndex === 0 ? 'left' : 'right', fontSize: 13, color: cellIndex === 0 ? '#0f172a' : '#334155', whiteSpace: 'nowrap' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDetailView = () => {
    if (detailLoading || !campaignDetail) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
          <div style={{ width: 34, height: 34, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'mspin 0.7s linear infinite', margin: '0 auto 14px' }} />
          Loading campaign details...
        </div>
      );
    }

    const summaryCards = [
      { label: 'Objective', value: campaignDetail.objective },
      { label: 'Budget', value: `${formatCurrency(campaignDetail.budget, currency)} · ${campaignDetail.budgetType || 'Budget'}` },
      { label: 'Duration', value: formatDuration(campaignDetail.startDate, campaignDetail.endDate) },
      { label: 'Last Updated', value: formatRelativeAge(campaignDetail.lastUpdated) },
    ];

    const campaignRows = [[
      cleanText(campaignDetail.name),
      renderStatusBadge(campaignDetail.effectiveStatus || campaignDetail.status),
      formatCurrency(campaignDetail.budget, currency),
      formatCurrency(campaignDetail.spend, currency),
      formatCurrency(safeNumber(campaignDetail.revenue), currency),
      formatMultiple(campaignDetail.roas),
      formatInteger(safeNumber(campaignDetail.purchases)),
    ]];

    const adSetRows = adSets.map((adSet) => ([
      cleanText(adSet.name),
      renderStatusBadge(adSet.effectiveStatus || adSet.status),
      adSet.optimizationGoal,
      formatCurrency(adSet.budget || adSet.lifetimeBudget, currency),
      formatCurrency(adSet.spend, currency),
      formatInteger(adSet.impressions),
      formatInteger(adSet.clicks),
      formatPercent(adSet.ctr),
      formatInteger(adSet.purchases),
    ]));

    const adRows = ads.map((ad) => ([
      <div key={ad.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {ad.thumbnailUrl ? (
          <img src={ad.thumbnailUrl} alt={ad.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>Ad</div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{ad.name}</div>
          <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{ad.creativeTitle || ad.adsetName}</div>
        </div>
      </div>,
      renderStatusBadge(ad.effectiveStatus || ad.status),
      ad.adsetName,
      formatCurrency(ad.spend, currency),
      formatInteger(ad.impressions),
      formatInteger(ad.clicks),
      formatPercent(ad.ctr),
      formatInteger(ad.purchases),
      formatMultiple(ad.roas),
    ]));

    return (
      <div style={{ background: '#fff', color: '#0f172a', borderRadius: 18, padding: 24, border: '1px solid #e5e7eb', minHeight: detailPanelHeight, maxHeight: detailPanelHeight, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Ads Manager / Campaigns</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
          <div>
            <button onClick={() => { setSelectedCampaignId(null); setCampaignDetail(null); }} style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', cursor: 'pointer', marginBottom: 8 }}>
              ← Back to campaigns
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{campaignDetail.name}</h2>
              {renderStatusBadge(campaignDetail.effectiveStatus || campaignDetail.status)}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>ID: {campaignDetail.id}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => loadCampaignDetails(campaignDetail.id)} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #dbe4f0', background: '#fff', color: '#334155', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Refresh</button>
            <button onClick={() => toggleStatus(campaignDetail)} style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: campaignDetail.status === 'ACTIVE' ? '#fee2e2' : '#dcfce7', color: campaignDetail.status === 'ACTIVE' ? '#b91c1c' : '#166534', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              {campaignDetail.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 18, padding: '18px 0', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', marginBottom: 18 }}>
          {summaryCards.map((card) => (
            <div key={card.label}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', fontWeight: 700, marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Active Recommendations', count: safeNumber(campaignDetail.recommendationsCount) },
            { label: 'History', count: 0 },
          ].map((item, index) => (
            <button key={item.label} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #dbe4f0', background: index === 0 ? '#fff' : '#f8fafc', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.label}
              <span style={{ minWidth: 20, height: 20, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{item.count}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All', count: 0 },
            { id: 'campaigns', label: 'Campaigns', count: 1 },
            { id: 'adsets', label: 'Ad Sets', count: adSets.length },
            { id: 'ads', label: 'Ads', count: ads.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDetailTab(tab.id as DetailTab)}
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                border: detailTab === tab.id ? 'none' : '1px solid #dbe4f0',
                background: detailTab === tab.id ? '#2563eb' : '#fff',
                color: detailTab === tab.id ? '#fff' : '#334155',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {tab.label}
              <span style={{ minWidth: 20, height: 20, borderRadius: 999, background: detailTab === tab.id ? 'rgba(255,255,255,0.2)' : '#eff6ff', color: detailTab === tab.id ? '#fff' : '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {detailTab === 'all' && (
          <div style={{ border: '1px dashed #dbe4f0', borderRadius: 18, padding: '64px 20px', textAlign: 'center', marginBottom: 22, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 30, fontWeight: 700 }}>✓</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>All caught up!</div>
            <div style={{ fontSize: 15, color: '#64748b', maxWidth: 540, margin: '0 auto' }}>
              You&apos;ve addressed all recommendations. Great job keeping your campaigns optimized.
            </div>
          </div>
        )}

        {detailTab === 'campaigns' && renderDetailTable(
          ['Campaign', 'Status', 'Budget', 'Spend', 'Revenue', 'ROAS', 'Purchases'],
          campaignRows,
        )}
        {detailTab === 'adsets' && renderDetailTable(
          ['Ad Set', 'Status', 'Optimization', 'Budget', 'Spend', 'Impressions', 'Clicks', 'CTR', 'Purchases'],
          adSetRows,
        )}
        {detailTab === 'ads' && renderDetailTable(
          ['Ad', 'Status', 'Ad Set', 'Spend', 'Impressions', 'Clicks', 'CTR', 'Purchases', 'ROAS'],
          adRows,
        )}
        </div>
      </div>
    );
  };

  return selectedCampaignId ? renderDetailView() : renderListView();
}

/* Main Page */
export default function MetaAdsManagerPage() {
  const [step, setStep] = useState(0);
  const [selectedPage, setSelectedPage] = useState<MetaPage | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await auth.getStatus();
        const ms = (res?.platforms?.meta ?? res?.meta) as any;
        if (ms?.connected) {
          if (ms.selectedAdAccountId) {
            setSelectedAccount({ id: ms.selectedAdAccountId, name: ms.selectedAdAccountName || ms.selectedAdAccountId });
            if (ms.selectedPageId) setSelectedPage({ id: ms.selectedPageId, name: ms.selectedPageName || ms.selectedPageId });
            setStep(3);
          } else if (ms.selectedPageId) {
            setSelectedPage({ id: ms.selectedPageId, name: ms.selectedPageName || ms.selectedPageId });
            setStep(2);
          } else {
            setStep(1);
          }
        } else {
          setStep(0);
        }
      } catch { setStep(0); }
      finally { setInitDone(true); }
    })();
  }, []);

  const handleConnected = useCallback(() => setStep(1), []);

  const handlePageSelect = useCallback(async (page: MetaPage) => {
    try { await auth.selectMetaPage(page.id, page.name); } catch { /* non-fatal */ }
    setSelectedPage(page);
    setStep(2);
  }, []);

  const handleAccountSelect = useCallback(async (account: AdAccount) => {
    try { await auth.selectMetaAdAccount(account.id, account.name); } catch { /* non-fatal */ }
    setSelectedAccount(account);
    setStep(3);
  }, []);

  const handleReset = useCallback(() => { setSelectedPage(null); setSelectedAccount(null); setStep(1); }, []);

  if (!initDone) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, color: 'var(--muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 30, height: 30, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'mspin 0.7s linear infinite', margin: '0 auto 14px' }} />
        <style>{`@keyframes mspin { to { transform: rotate(360deg); } }`}</style>
        Checking connection…
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>f</div>
            <h1 className="page-title" style={{ margin: 0 }}>Meta Ads Manager</h1>
          </div>
          <p className="page-subtitle">Connect your Meta account and manage Facebook & Instagram campaigns</p>
        </div>
        {step === 3 && (
          <button onClick={handleReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
            ⚙ Change Account
          </button>
        )}
      </div>

      <StepBar current={step} />

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 24px' }}>
        {step === 0 && <ConnectStep onConnected={handleConnected} />}
        {step === 1 && <SelectPageStep onSelect={handlePageSelect} onSkip={() => setStep(2)} />}
        {step === 2 && <SelectAdAccountStep selectedPage={selectedPage} onSelect={handleAccountSelect} onBack={() => setStep(1)} />}
        {step === 3 && <ManageAdsStep selectedPage={selectedPage} selectedAccount={selectedAccount} onReset={handleReset} />}
      </div>
    </div>
  );
}
