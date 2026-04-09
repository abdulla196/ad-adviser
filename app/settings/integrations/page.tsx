'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../lib/apiClient';

type PlatformStatus = {
  connected: boolean;
  connectedAt?: string;
  activeIntegrationId?: number | null;
  selectedPageId?: string | null;
  selectedPageName?: string | null;
  selectedAdAccountId?: string | null;
  selectedAdAccountName?: string | null;
  integrations?: MetaIntegration[];
};

type MetaIntegration = {
  id: number;
  metaUserName?: string | null;
  metaUserPictureUrl?: string | null;
  selectedPageId?: string | null;
  selectedPageName?: string | null;
  selectedAdAccountId?: string | null;
  selectedAdAccountName?: string | null;
  selectedAdAccountCurrency?: string | null;
  connectedAt?: string;
  isActive?: boolean;
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

function SelectAdAccountModal({
  open,
  loading,
  accounts,
  onClose,
  onSelect,
}: {
  open: boolean;
  loading: boolean;
  accounts: AdAccount[];
  onClose: () => void;
  onSelect: (account: AdAccount) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((account) =>
      account.name.toLowerCase().includes(q) || account.id.toLowerCase().includes(q)
    );
  }, [accounts, query]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5,7,12,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
      <div style={{ width: '100%', maxWidth: 540, background: '#fff', color: '#111', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', padding: 20, boxShadow: '0 20px 70px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 34, margin: 0, color: '#10131a', fontFamily: 'Syne, sans-serif' }}>Select Ad Account</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, color: '#5b6470', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 15, color: '#576070' }}>Choose the ad account to use for this Meta integration.</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or ID..."
          style={{ width: '100%', border: '2px solid #d8dde6', borderRadius: 12, padding: '12px 14px', fontSize: 18, marginBottom: 14, outline: 'none' }}
        />

        {loading ? (
          <p style={{ textAlign: 'center', color: '#5c6672', padding: '20px 0' }}>Loading your ad accounts...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#5c6672', padding: '20px 0' }}>No ad accounts found on this Meta login.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
            {filtered.map((account) => (
              <button
                key={account.id}
                onClick={() => onSelect(account)}
                style={{ border: '1px solid #d8dde6', borderRadius: 12, background: '#f7f9fc', padding: '14px 14px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                  M
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 24, color: '#111827', fontWeight: 600, lineHeight: 1.15 }}>{account.name}</div>
                  <div style={{ fontSize: 15, color: '#6b7280', marginTop: 4 }}>ID: {account.id}</div>
                  {account.currency && <div style={{ fontSize: 13, color: '#8a94a6', marginTop: 4 }}>Currency: {account.currency}</div>}
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
  const [pagePickerOpen, setPagePickerOpen] = useState(false);
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<number | null>(null);

  const metaStatus = status.meta;
  const metaIntegrations = metaStatus?.integrations || [];

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
    setPagePickerOpen(true);
    try {
      const data = await auth.getMetaPages();
      setPages(data.pages || []);
    } catch {
      setPages([]);
    } finally {
      setPagesLoading(false);
    }
  }, []);

  const loadAccounts = useCallback(async (integrationId: number) => {
    setAccountsLoading(true);
    setAccountPickerOpen(true);
    try {
      const data = await auth.getMetaAdAccounts(integrationId);
      setAccounts(data.adAccounts || []);
    } catch {
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (metaStatus?.activeIntegrationId) {
      setSelectedIntegrationId(metaStatus.activeIntegrationId);
    }
  }, [metaStatus?.activeIntegrationId]);

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'META_OAUTH_SUCCESS') {
        await refreshStatus();
        const refreshed = await auth.getStatus().catch(() => null);
        const activeIntegrationId = refreshed?.platforms?.meta?.activeIntegrationId;
        if (activeIntegrationId) {
          setSelectedIntegrationId(activeIntegrationId);
          setPagesLoading(true);
          setPagePickerOpen(true);
          try {
            const data = await auth.getMetaPages();
            setPages(data.pages || []);
          } catch {
            setPages([]);
          } finally {
            setPagesLoading(false);
          }
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [refreshStatus]);

  const connectMeta = async () => {
    auth.connectMeta();
  };

  const selectPage = async (page: MetaPage) => {
    try {
      if (!selectedIntegrationId) return;
      await auth.selectMetaPage({
        integrationId: selectedIntegrationId,
        pageId: page.id,
        pageName: page.name,
        pagePictureUrl: page.picture?.data?.url,
        pageCategory: page.category,
      });
      setPagePickerOpen(false);
      await refreshStatus();
      await loadAccounts(selectedIntegrationId);
    } catch {
      // Keep modal open so user can retry.
    }
  };

  const selectAccount = async (account: AdAccount) => {
    try {
      if (!selectedIntegrationId) return;
      await auth.selectMetaAdAccount({
        integrationId: selectedIntegrationId,
        adAccountId: account.id,
        adAccountName: account.name,
        currency: account.currency,
      });
      setAccountPickerOpen(false);
      await refreshStatus();
      router.push('/ads-manager/meta');
    } catch {
      // keep modal open
    }
  };

  const activateIntegration = async (integrationId: number) => {
    try {
      await auth.activateMetaIntegration(integrationId);
      setSelectedIntegrationId(integrationId);
      await refreshStatus();
    } catch {
      // ignore for now
    }
  };

  const removeIntegration = async (integrationId: number) => {
    try {
      await auth.removeMetaIntegration(integrationId);
      if (selectedIntegrationId === integrationId) {
        setSelectedIntegrationId(null);
      }
      await refreshStatus();
    } catch {
      // ignore for now
    }
  };

  const configureIntegration = async (integrationId: number) => {
    setSelectedIntegrationId(integrationId);
    await activateIntegration(integrationId);
    setPagesLoading(true);
    setPagePickerOpen(true);
    try {
      const data = await auth.getMetaPages();
      setPages(data.pages || []);
    } catch {
      setPages([]);
    } finally {
      setPagesLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Save multiple Meta logins per user and choose which page and ad account each integration should use</p>
        </div>
      </div>

      <div style={{ maxWidth: 920, display: 'grid', gap: 20 }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={logoWrap}>M</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>Meta Ads</div>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
                Each Meta login is stored under the current user. Pick the page and ad account once, then the dashboard uses the active integration automatically.
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
                {metaStatus?.selectedPageName ? (
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>
                    Active page: {metaStatus.selectedPageName}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>No page selected yet</span>
                )}
                {metaStatus?.selectedAdAccountName ? (
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>
                    Active account: {metaStatus.selectedAdAccountName}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>No ad account selected yet</span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Not connected</div>
            )}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!status.meta?.connected ? (
              <button style={btnPrimary} onClick={connectMeta}>
                Add Meta Integration
              </button>
            ) : (
              <>
                <button style={btnPrimary} onClick={connectMeta}>Add Another Meta Login</button>
                <button
                  style={{ ...btnSecondary, borderColor: 'rgba(248,113,113,0.3)', color: 'var(--red)' }}
                  onClick={async () => {
                    await auth.disconnect('meta');
                    await refreshStatus();
                  }}
                >
                  Remove All Meta Integrations
                </button>
              </>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Saved Meta Integrations</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Select the active integration or configure page and ad account for a new one.</div>
            </div>
          </div>

          {metaIntegrations.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>No Meta integrations saved yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {metaIntegrations.map((integration) => (
                <div key={integration.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: integration.isActive ? 'rgba(24,119,242,0.08)' : 'var(--bg3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {integration.metaUserPictureUrl ? (
                        <img src={integration.metaUserPictureUrl} alt={integration.metaUserName || 'Meta profile'} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1877F2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {(integration.metaUserName || 'M').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{integration.metaUserName || `Meta Integration #${integration.id}`}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                          {integration.selectedPageName || 'No page selected'}
                          {' · '}
                          {integration.selectedAdAccountName || 'No ad account selected'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {!integration.isActive && (
                        <button style={btnSecondary} onClick={() => activateIntegration(integration.id)}>
                          Use This Integration
                        </button>
                      )}
                      <button style={btnPrimary} onClick={() => configureIntegration(integration.id)}>
                        {integration.selectedAdAccountId ? 'Update Page / Account' : 'Finish Setup'}
                      </button>
                      <button style={{ ...btnSecondary, borderColor: 'rgba(248,113,113,0.3)', color: 'var(--red)' }} onClick={() => removeIntegration(integration.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SelectMetaPageModal
        open={pagePickerOpen}
        loading={pagesLoading}
        pages={pages}
        onClose={() => setPagePickerOpen(false)}
        onSelect={selectPage}
      />

      <SelectAdAccountModal
        open={accountPickerOpen}
        loading={accountsLoading}
        accounts={accounts}
        onClose={() => setAccountPickerOpen(false)}
        onSelect={selectAccount}
      />
    </div>
  );
}
