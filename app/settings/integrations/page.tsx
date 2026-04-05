'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/apiClient';

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

const cardStyle: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '24px',
};

const btnPrimary: React.CSSProperties = {
  padding: '11px 20px',
  borderRadius: '999px',
  border: 'none',
  background: '#0c0f17',
  color: '#fff',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--bg3)',
  color: 'var(--text)',
  fontWeight: 500,
  fontSize: '13px',
  cursor: 'pointer',
};

const logoWrap: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 14,
  background: '#1877F2',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: 20,
  flexShrink: 0,
};

function SelectMetaPageModal({
  open,
  loading,
  pages,
  onClose,
  onSelect,
}: {
  open: boolean;
  loading: boolean;
  pages: MetaPage[];
  onClose: () => void;
  onSelect: (page: MetaPage) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((page) =>
      page.name.toLowerCase().includes(q) || page.id.toLowerCase().includes(q)
    );
  }, [pages, query]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5,7,12,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
      <div style={{ width: '100%', maxWidth: 540, background: '#fff', color: '#111', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', padding: 20, boxShadow: '0 20px 70px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 34, margin: 0, color: '#10131a', fontFamily: 'Syne, sans-serif' }}>Select Facebook Page</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, color: '#5b6470', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 15, color: '#576070' }}>Choose one of the Facebook pages you admin so we can open the Meta ads manager flow for that page.</p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or ID..."
          style={{ width: '100%', border: '2px solid #d8dde6', borderRadius: 12, padding: '12px 14px', fontSize: 18, marginBottom: 14, outline: 'none' }}
        />

        {loading ? (
          <p style={{ textAlign: 'center', color: '#5c6672', padding: '20px 0' }}>Loading your admin pages...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#5c6672', padding: '20px 0' }}>
            <p style={{ margin: '0 0 10px' }}>No admin pages found.</p>
            <p style={{ margin: 0, fontSize: 13 }}>
              If your Meta app still needs page access approval, keep login on basic scopes for now. Enable
              {' '}
              <strong style={{ color: '#10131a' }}>pages_show_list</strong>
              {' '}
              later and set
              {' '}
              <strong style={{ color: '#10131a' }}>META_ENABLE_ADVANCED_SCOPES=true</strong>
              {' '}
              in the backend once Meta has approved it.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
            {filtered.map((page) => (
              <button
                key={page.id}
                onClick={() => onSelect(page)}
                style={{ border: '1px solid #d8dde6', borderRadius: 12, background: '#f7f9fc', padding: '14px 14px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                {page.picture?.data?.url ? (
                  <div
                    aria-label={page.name}
                    role="img"
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      backgroundImage: `url(${page.picture.data.url})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                    {page.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 24, color: '#111827', fontWeight: 600, lineHeight: 1.15 }}>{page.name}</div>
                  <div style={{ fontSize: 15, color: '#6b7280', marginTop: 4 }}>ID: {page.id}</div>
                  {page.category && <div style={{ fontSize: 13, color: '#8a94a6', marginTop: 4 }}>{page.category}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Record<string, PlatformStatus>>({});
  const [statusLoading, setStatusLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pages, setPages] = useState<MetaPage[]>([]);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await auth.getStatus();
      setStatus((res?.platforms || {}) as Record<string, PlatformStatus>);
    } catch {
      setStatus({});
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const loadPages = useCallback(async () => {
    setPagesLoading(true);
    setPickerOpen(true);
    try {
      const data = await auth.getMetaPages();
      setPages(data.pages || []);
    } catch {
      setPages([]);
    } finally {
      setPagesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'META_OAUTH_SUCCESS') {
        await refreshStatus();
        await loadPages();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [refreshStatus, loadPages]);

  const connectMeta = async () => {
    auth.connectMeta();
  };

  const selectPage = async (page: MetaPage) => {
    try {
      await auth.selectMetaPage(page.id, page.name);
      setPickerOpen(false);
      await refreshStatus();
      router.push('/campaigns');
    } catch {
      // Keep modal open so user can retry.
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Login with Meta and choose the ad account to use in this workspace</p>
        </div>
      </div>

      <div style={{ maxWidth: 760 }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={logoWrap}>M</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>Meta Ads</div>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
                Login with your personal Facebook account, then select one of the Facebook pages you admin.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            {statusLoading ? (
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Checking connection...</div>
            ) : status.meta?.connected ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 20, background: 'rgba(52,211,153,0.12)', color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
                  Connected
                </span>
                {status.meta?.selectedPageName ? (
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>
                    Page: {status.meta.selectedPageName}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>No page selected yet</span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Not connected</div>
            )}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!status.meta?.connected ? (
              <button style={btnPrimary} onClick={connectMeta}>
                Login With Meta
              </button>
            ) : (
              <>
                <button style={btnPrimary} onClick={loadPages}>Select Page</button>
                <button
                  style={{ ...btnSecondary, borderColor: 'rgba(248,113,113,0.3)', color: 'var(--red)' }}
                  onClick={async () => {
                    await auth.disconnect('meta');
                    await refreshStatus();
                  }}
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <SelectMetaPageModal
        open={pickerOpen}
        loading={pagesLoading}
        pages={pages}
        onClose={() => setPickerOpen(false)}
        onSelect={selectPage}
      />
    </div>
  );
}
