'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { auth } from '../../../lib/apiClient';

type PlatformStatus = {
  connected: boolean;
  connectedAt?: string;
  selectedAdAccountId?: string | null;
  selectedAdAccountName?: string | null;
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
    return accounts.filter((a) =>
      a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    );
  }, [accounts, query]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(5,7,12,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
      <div style={{ width: '100%', maxWidth: 540, background: '#fff', color: '#111', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', padding: 20, boxShadow: '0 20px 70px rgba(0,0,0,0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 34, margin: 0, color: '#10131a', fontFamily: 'Syne, sans-serif' }}>Select Meta Ad Account</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 26, color: '#5b6470', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 15, color: '#576070' }}>Choose which Meta ad account you want to connect to this workspace.</p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or ID..."
          style={{ width: '100%', border: '2px solid #d8dde6', borderRadius: 12, padding: '12px 14px', fontSize: 18, marginBottom: 14, outline: 'none' }}
        />

        {loading ? (
          <p style={{ textAlign: 'center', color: '#5c6672', padding: '20px 0' }}>Loading ad accounts...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#5c6672', padding: '20px 0' }}>No ad accounts found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
            {filtered.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onSelect(acc)}
                style={{ border: '1px solid #d8dde6', borderRadius: 12, background: '#f7f9fc', padding: '14px 14px', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 32, color: '#111827', fontWeight: 600, lineHeight: 1.15 }}>{acc.name}</div>
                <div style={{ fontSize: 24, color: '#6b7280', marginTop: 4 }}>ID: {acc.id}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<Record<string, PlatformStatus>>({});
  const [statusLoading, setStatusLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accounts, setAccounts] = useState<AdAccount[]>([]);

  const platforms = [
    {
      id: 'meta',
      name: 'Meta Ads',
      logo: 'M',
      logoColor: '#1877F2',
      description: 'Login with your personal Facebook account, then choose a Meta ad account.',
    },
    {
      id: 'tiktok',
      name: 'TikTok Ads',
      logo: 'T',
      logoColor: '#010101',
      description: 'Connect your TikTok ads account to sync campaigns and metrics.',
    },
    {
      id: 'snapchat',
      name: 'Snapchat Ads',
      logo: 'S',
      logoColor: '#FFFC00',
      description: 'Connect your Snapchat ads account for campaign performance tracking.',
      logoTextColor: '#000',
    },
    {
      id: 'google',
      name: 'Google Ads',
      logo: 'G',
      logoColor: '#4285F4',
      description: 'Connect your Google Ads account to manage campaigns in one place.',
    },
  ];

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

  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    setPickerOpen(true);
    try {
      const data = await auth.getMetaAdAccounts();
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
    const onMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'META_OAUTH_SUCCESS') {
        await refreshStatus();
        await loadAccounts();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [refreshStatus, loadAccounts]);

  const connectMeta = async () => {
    auth.connectMeta();
  };

  const connectByPlatform: Record<string, () => void> = {
    meta: () => connectMeta(),
    tiktok: () => auth.connectTikTok(),
    snapchat: () => auth.connectSnapchat(),
    google: () => auth.connectGoogle(),
  };

  const selectAccount = async (acc: AdAccount) => {
    try {
      await auth.selectMetaAdAccount(acc.id, acc.name);
      setPickerOpen(false);
      await refreshStatus();
    } catch {
      // Keep modal open so user can retry.
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Connect and manage your third-party integrations</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {platforms.map((platform) => {
          const current = status[platform.id] || { connected: false };
          return (
            <div key={platform.id} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ ...logoWrap, background: platform.logoColor, color: platform.logoTextColor || '#fff' }}>{platform.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>{platform.name}</div>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
                    {platform.description}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                {statusLoading ? (
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Checking connection...</div>
                ) : current.connected ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 20, background: 'rgba(52,211,153,0.12)', color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
                      Connected
                    </span>
                    {platform.id === 'meta' && current.selectedAdAccountName && (
                      <span style={{ fontSize: 12, color: 'var(--text)' }}>
                        Selected: {current.selectedAdAccountName}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Not connected</div>
                )}
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!current.connected ? (
                  <button style={btnPrimary} onClick={connectByPlatform[platform.id]}>
                    Connect
                  </button>
                ) : (
                  <>
                    {platform.id === 'meta' && (
                      <button style={btnPrimary} onClick={loadAccounts}>Select Ad Account</button>
                    )}
                    <button
                      style={{ ...btnSecondary, borderColor: 'rgba(248,113,113,0.3)', color: 'var(--red)' }}
                      onClick={async () => {
                        await auth.disconnect(platform.id);
                        await refreshStatus();
                      }}
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SelectAdAccountModal
        open={pickerOpen}
        loading={accountsLoading}
        accounts={accounts}
        onClose={() => setPickerOpen(false)}
        onSelect={selectAccount}
      />
    </div>
  );
}
