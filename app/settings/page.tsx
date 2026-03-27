'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth } from '../../lib/apiClient';

/* ── Shared Styles ── */
const card = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '20px',
};
const sectionTitle = {
  fontFamily: 'Syne, sans-serif',
  fontWeight: 600,
  fontSize: '15px',
  color: 'var(--text)',
  marginBottom: '4px',
};
const sectionDesc = {
  fontSize: '13px',
  color: 'var(--muted)',
  marginBottom: '20px',
};
const label = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--muted)',
  marginBottom: '6px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
};
const input = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  background: 'var(--bg3)',
  color: 'var(--text)',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s',
};
const btnPrimary = {
  padding: '9px 20px',
  borderRadius: '8px',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
};
const btnSecondary = {
  padding: '9px 20px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'var(--bg3)',
  color: 'var(--muted)',
  fontWeight: 500,
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'all 0.15s',
};
const divider = {
  borderTop: '1px solid var(--border)',
  margin: '20px 0',
};

/* ── Tab definitions ── */
const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'platforms', label: 'Connected Platforms' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Billing' },
  { id: 'team', label: 'Team' },
];

/* ── Profile Tab ── */
function ProfileTab() {
  return (
    <>
      <div style={card}>
        <h3 style={sectionTitle}>Personal Information</h3>
        <p style={sectionDesc}>Update your account details and preferences.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={label}>First Name</label>
            <input style={input} defaultValue="John" />
          </div>
          <div>
            <label style={label}>Last Name</label>
            <input style={input} defaultValue="Doe" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Email Address</label>
            <input style={input} type="email" defaultValue="john@company.com" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Company</label>
            <input style={input} defaultValue="Acme Marketing Inc." />
          </div>
          <div>
            <label style={label}>Phone</label>
            <input style={input} type="tel" defaultValue="+1 555-0123" />
          </div>
          <div>
            <label style={label}>Timezone</label>
            <select style={input}>
              <option>UTC-5 (Eastern)</option>
              <option>UTC-6 (Central)</option>
              <option>UTC-7 (Mountain)</option>
              <option>UTC-8 (Pacific)</option>
              <option>UTC+0 (GMT)</option>
              <option>UTC+1 (CET)</option>
              <option>UTC+2 (EET)</option>
              <option>UTC+3 (AST)</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button style={btnPrimary}>Save Changes</button>
          <button style={btnSecondary}>Cancel</button>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Password</h3>
        <p style={sectionDesc}>Change your password. Youll be signed out of other devices.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={label}>Current Password</label>
            <input style={input} type="password" placeholder="••••••••" />
          </div>
          <div>
            <label style={label}>New Password</label>
            <input style={input} type="password" placeholder="••••••••" />
          </div>
          <div>
            <label style={label}>Confirm New Password</label>
            <input style={input} type="password" placeholder="••••••••" />
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button style={btnPrimary}>Update Password</button>
        </div>
      </div>

      <div style={{ ...card, borderColor: 'rgba(248,113,113,0.3)' }}>
        <h3 style={{ ...sectionTitle, color: 'var(--red)' }}>Danger Zone</h3>
        <p style={sectionDesc}>Permanently delete your account and all associated data.</p>
        <button style={{ ...btnSecondary, borderColor: 'rgba(248,113,113,0.4)', color: 'var(--red)' }}>
          Delete Account
        </button>
      </div>
    </>
  );
}

/* ── Platforms Tab ── */
const PLATFORM_META: Record<string, { name: string; color: string; letter: string; textColor?: string }> = {
  google:   { name: 'Google Ads',   color: '#4285F4', letter: 'G' },
  meta:     { name: 'Meta Ads',     color: '#1877F2', letter: 'M' },
  tiktok:   { name: 'TikTok Ads',   color: '#ff0050', letter: 'T' },
  snapchat: { name: 'Snapchat Ads', color: '#FFFC00', letter: 'S', textColor: '#000' },
};

const connectFns: Record<string, () => void> = {
  meta:     auth.connectMeta,
  tiktok:   auth.connectTikTok,
  snapchat: auth.connectSnapchat,
  google:   auth.connectGoogle,
};

function PlatformsTab() {
  const [status, setStatus] = useState<Record<string, { connected: boolean; connectedAt?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [adAccounts, setAdAccounts] = useState<Array<{ id: string; name: string; account_status?: number; currency?: string }>>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await auth.getStatus();
      const mapped: Record<string, { connected: boolean; connectedAt?: string }> = {};
      if (data?.platforms) {
        for (const [key, val] of Object.entries(data.platforms as Record<string, { connected: boolean; connectedAt?: string }>)) {
          mapped[key] = { connected: !!val?.connected, connectedAt: val?.connectedAt || undefined };
        }
      }
      setStatus(mapped);
    } catch {
      setStatus(
        Object.fromEntries(Object.keys(PLATFORM_META).map((k) => [k, { connected: false }]))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Listen for Meta OAuth popup success
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'META_OAUTH_SUCCESS') {
        await fetchStatus();
        openAccountPicker();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchStatus]);

  const openAccountPicker = async () => {
    setAccountsLoading(true);
    setShowAccountPicker(true);
    try {
      const data = await auth.getMetaAdAccounts();
      setAdAccounts(data.adAccounts || []);
    } catch {
      setAdAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleSelectAccount = async (account: { id: string; name: string }) => {
    try {
      await auth.selectMetaAdAccount(account.id, account.name);
      setShowAccountPicker(false);
      fetchStatus();
    } catch { /* ignore */ }
  };

  return (
    <>
      {/* ── Ad Account Picker Modal ── */}
      {showAccountPicker && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '32px', width: '100%',
            maxWidth: '480px', maxHeight: '80vh', overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Select Ad Account</h3>
              <button onClick={() => setShowAccountPicker(false)} style={{
                background: 'none', border: 'none', color: 'var(--muted)',
                fontSize: '20px', cursor: 'pointer', lineHeight: 1,
              }}>✕</button>
            </div>
            <p style={{ ...sectionDesc, marginBottom: '20px' }}>
              Choose which Meta ad account to connect.
            </p>
            {accountsLoading ? (
              <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                Loading your ad accounts…
              </p>
            ) : adAccounts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '12px' }}>
                  No ad accounts found on this Facebook account.
                </p>
                <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: '16px' }}>
                  Make sure your Facebook account has access to at least one Meta Ads ad account, and that the app has <strong style={{ color: 'var(--text)' }}>ads_read</strong> permission enabled.
                </p>
                <button onClick={() => setShowAccountPicker(false)} style={{ ...btnPrimary }}>
                  Close
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {adAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleSelectAccount(account)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 16px', background: 'var(--bg3)',
                      borderRadius: '10px', border: '1px solid var(--border)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '10px', background: '#1877F2',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 15, flexShrink: 0,
                    }}>M</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {account.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        {account.id}{account.currency ? ` · ${account.currency}` : ''}
                      </div>
                    </div>
                    <span style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, flexShrink: 0 }}>Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={card}>
        <h3 style={sectionTitle}>Connected Ad Platforms</h3>
        <p style={sectionDesc}>Manage your advertising platform connections. Connect accounts to sync campaign data.</p>
        {loading ? (
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading platform status…</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(PLATFORM_META).map(([id, p]) => {
              const s = status[id] || { connected: false };
              return (
                <div key={id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  background: 'var(--bg3)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: p.color,
                    color: p.textColor || '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: '16px',
                    flexShrink: 0,
                  }}>
                    {p.letter}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                    {s.connected ? (
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                        Connected {s.connectedAt ? new Date(s.connectedAt).toLocaleDateString() : ''}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>Not connected</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {s.connected && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: 'rgba(52,211,153,0.12)',
                        color: 'var(--green)',
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
                        Connected
                      </span>
                    )}
                    {s.connected && id === 'meta' && (
                      <button style={btnSecondary} onClick={openAccountPicker}>
                        Switch Account
                      </button>
                    )}
                    <button
                      style={s.connected ? { ...btnSecondary, borderColor: 'rgba(248,113,113,0.3)', color: 'var(--red)' } : btnPrimary}
                      onClick={async () => {
                        if (s.connected) {
                          try {
                            await auth.disconnect(id);
                            fetchStatus();
                          } catch { /* ignore */ }
                        } else {
                          connectFns[id]();
                        }
                      }}
                    >
                      {s.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>API Keys</h3>
        <p style={sectionDesc}>Manage API keys for programmatic access to your ad data.</p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px',
          background: 'var(--bg3)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}>
          <code style={{ flex: 1, fontSize: '13px', color: 'var(--muted)', fontFamily: 'monospace' }}>
            sk-••••••••••••••••••••••••••••3x7q
          </code>
          <button style={btnSecondary}>Copy</button>
          <button style={{ ...btnSecondary, borderColor: 'rgba(248,113,113,0.3)', color: 'var(--red)' }}>Revoke</button>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button style={btnPrimary}>Generate New Key</button>
        </div>
      </div>
    </>
  );
}

/* ── Notifications Tab ── */
function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => setOn(!on)}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        border: 'none',
        background: on ? 'var(--accent)' : 'var(--bg3)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: '3px',
        left: on ? '20px' : '3px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}

const notifSettings = [
  { label: 'Campaign Performance Alerts', desc: 'Get notified about significant campaign performance changes', default: true },
  { label: 'Budget Alerts', desc: 'Alert when campaigns approach or exceed their budget', default: true },
  { label: 'Platform Sync Errors', desc: 'Notify when ad platform data sync fails', default: true },
  { label: 'Weekly Summary Report', desc: 'Receive a weekly email summary of all ad performance', default: false },
  { label: 'New Feature Announcements', desc: 'Stay updated about new AdAdviser features', default: false },
  { label: 'Team Activity', desc: 'Notifications about team member actions', default: true },
];

function NotificationsTab() {
  return (
    <>
      <div style={card}>
        <h3 style={sectionTitle}>Email Notifications</h3>
        <p style={sectionDesc}>Choose which notifications you want to receive via email.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {notifSettings.map((n, i) => (
            <div key={n.label}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{n.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{n.desc}</div>
                </div>
                <ToggleSwitch defaultChecked={n.default} />
              </div>
              {i < notifSettings.length - 1 && <div style={divider} />}
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Alert Thresholds</h3>
        <p style={sectionDesc}>Set custom thresholds for performance alerts.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={label}>CPC Alert Threshold</label>
            <input style={input} type="number" defaultValue="5.00" step="0.01" />
          </div>
          <div>
            <label style={label}>CTR Drop Alert (%)</label>
            <input style={input} type="number" defaultValue="20" />
          </div>
          <div>
            <label style={label}>Budget Usage Alert (%)</label>
            <input style={input} type="number" defaultValue="80" />
          </div>
          <div>
            <label style={label}>ROAS Minimum Threshold</label>
            <input style={input} type="number" defaultValue="1.5" step="0.1" />
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <button style={btnPrimary}>Save Thresholds</button>
        </div>
      </div>
    </>
  );
}

/* ── Billing Tab ── */
function BillingTab() {
  return (
    <>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h3 style={sectionTitle}>Current Plan</h3>
            <p style={sectionDesc}>Manage your subscription and billing details.</p>
          </div>
          <span style={{
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            background: 'rgba(124,106,247,0.15)',
            color: 'var(--accent2)',
          }}>
            Pro Plan
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          marginBottom: '20px',
        }}>
          {[
            { label: 'Monthly Price', value: '$49/mo' },
            { label: 'Billing Cycle', value: 'Monthly' },
            { label: 'Next Billing Date', value: 'Apr 26, 2026' },
          ].map((item) => (
            <div key={item.label} style={{
              padding: '16px',
              background: 'var(--bg3)',
              borderRadius: '10px',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{item.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={btnPrimary}>Upgrade Plan</button>
          <button style={btnSecondary}>Cancel Subscription</button>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Payment Method</h3>
        <p style={sectionDesc}>Your payment information.</p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px',
          background: 'var(--bg3)',
          borderRadius: '10px',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: '48px', height: '32px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #1a1f71, #2c3e93)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '10px', fontWeight: 700,
          }}>VISA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>•••• •••• •••• 4242</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Expires 12/2027</div>
          </div>
          <button style={btnSecondary}>Update</button>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Billing History</h3>
        <p style={sectionDesc}>Your recent invoices.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Date', 'Description', 'Amount', 'Status', ''].map((h) => (
                <th key={h} style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Mar 26, 2026', desc: 'Pro Plan - Monthly', amount: '$49.00', status: 'Paid' },
              { date: 'Feb 26, 2026', desc: 'Pro Plan - Monthly', amount: '$49.00', status: 'Paid' },
              { date: 'Jan 26, 2026', desc: 'Pro Plan - Monthly', amount: '$49.00', status: 'Paid' },
            ].map((inv, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text)' }}>{inv.date}</td>
                <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--muted)' }}>{inv.desc}</td>
                <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{inv.amount}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                    background: 'rgba(52,211,153,0.12)', color: 'var(--green)',
                  }}>{inv.status}</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <button style={{ ...btnSecondary, padding: '5px 12px', fontSize: '12px' }}>Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Team Tab ── */
const teamMembers = [
  { name: 'John Doe', email: 'john@company.com', role: 'Owner', initials: 'JD', color: 'var(--accent)' },
  { name: 'Sarah Smith', email: 'sarah@company.com', role: 'Admin', initials: 'SS', color: '#34d399' },
  { name: 'Mike Johnson', email: 'mike@company.com', role: 'Editor', initials: 'MJ', color: '#f59e0b' },
];

function TeamTab() {
  return (
    <>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={sectionTitle}>Team Members</h3>
            <p style={{ ...sectionDesc, marginBottom: 0 }}>Manage who has access to your AdAdviser workspace.</p>
          </div>
          <button style={btnPrimary}>Invite Member</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {teamMembers.map((m, i) => (
            <div key={m.email}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 0',
              }}>
                <div style={{
                  width: '38px', height: '38px',
                  borderRadius: '50%',
                  background: m.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: '#fff',
                  flexShrink: 0,
                }}>
                  {m.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{m.email}</div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: m.role === 'Owner' ? 'rgba(124,106,247,0.15)' : 'rgba(255,255,255,0.06)',
                  color: m.role === 'Owner' ? 'var(--accent2)' : 'var(--muted)',
                }}>
                  {m.role}
                </span>
                {m.role !== 'Owner' && (
                  <button style={{ ...btnSecondary, padding: '6px 14px', fontSize: '12px' }}>Remove</button>
                )}
              </div>
              {i < teamMembers.length - 1 && <div style={divider} />}
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Roles & Permissions</h3>
        <p style={sectionDesc}>Define what each role can access.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Permission', 'Owner', 'Admin', 'Editor', 'Viewer'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textAlign: h === 'Permission' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { perm: 'View campaigns', roles: [true, true, true, true] },
              { perm: 'Edit campaigns', roles: [true, true, true, false] },
              { perm: 'Create campaigns', roles: [true, true, true, false] },
              { perm: 'Manage billing', roles: [true, true, false, false] },
              { perm: 'Manage team', roles: [true, true, false, false] },
              { perm: 'Delete account', roles: [true, false, false, false] },
            ].map((row) => (
              <tr key={row.perm} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text)' }}>{row.perm}</td>
                {row.roles.map((v, j) => (
                  <td key={j} style={{ padding: '10px 12px', textAlign: 'center', fontSize: '14px' }}>
                    {v ? <span style={{ color: 'var(--green)' }}>✓</span> : <span style={{ color: 'var(--muted)', opacity: 0.4 }}>—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Main Settings Page ── */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTab = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'platforms': return <PlatformsTab />;
      case 'notifications': return <NotificationsTab />;
      case 'billing': return <BillingTab />;
      case 'team': return <TeamTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account, platforms, and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? 'var(--accent2)' : 'var(--muted)',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'all 0.15s',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {renderTab()}
    </div>
  );
}
