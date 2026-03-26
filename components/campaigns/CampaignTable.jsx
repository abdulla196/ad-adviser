'use client';

import { useState, useEffect } from 'react';
import PlatformBadge from '../dashboard/PlatformBadge';
import { unified } from '../../lib/apiClient';

const sampleCampaigns = [
  {
    id: 1,
    name: 'Summer Sale 2024',
    platform: 'Google',
    status: 'active',
    spend: '$2,450',
    impressions: 54200,
    clicks: 1224,
    ctr: '2.26%',
    cpc: '$2.00',
    roi: '3.2x',
  },
  {
    id: 2,
    name: 'Brand Awareness',
    platform: 'Meta',
    status: 'active',
    spend: '$1,850',
    impressions: 125400,
    clicks: 3254,
    ctr: '2.59%',
    cpc: '$0.57',
    roi: '2.8x',
  },
  {
    id: 3,
    name: 'Product Launch',
    platform: 'TikTok',
    status: 'paused',
    spend: '$950',
    impressions: 89200,
    clicks: 2145,
    ctr: '2.41%',
    cpc: '$0.44',
    roi: '1.9x',
  },
  {
    id: 4,
    name: 'Engagement Boost',
    platform: 'Snapchat',
    status: 'active',
    spend: '$1,200',
    impressions: 67800,
    clicks: 1620,
    ctr: '2.39%',
    cpc: '$0.74',
    roi: '2.1x',
  },
  {
    id: 5,
    name: 'Retargeting',
    platform: 'Google',
    status: 'active',
    spend: '$3,100',
    impressions: 98700,
    clicks: 3456,
    ctr: '3.50%',
    cpc: '$0.90',
    roi: '4.5x',
  },
];

/** Normalize unified API response to table row shape */
const toRow = (c) => ({
  id: c.id,
  name: c.name,
  platform: c.platform?.charAt(0).toUpperCase() + c.platform?.slice(1),
  status: c.status?.toLowerCase() === 'active' ? 'active' : 'paused',
  spend: `$${Number(c.spend || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
  impressions: c.impressions || 0,
  clicks: c.clicks || 0,
  ctr: `${(c.ctr || 0).toFixed(2)}%`,
  cpc: `$${(c.cpc || 0).toFixed(2)}`,
  roi: c.roas ? `${c.roas.toFixed(1)}x` : '—',
});

const card = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' };
const thStyle = { padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' };
const tdStyle = { padding: '12px 16px', fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap' };
const tdMuted = { ...tdStyle, color: 'var(--muted)' };

export default function CampaignTable() {
  const [campaigns, setCampaigns] = useState(sampleCampaigns);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    unified.getCampaigns()
      .then((data) => {
        if (cancelled) return;
        const rows = (data.campaigns || data || []).map(toRow);
        if (rows.length > 0) {
          setCampaigns(rows);
          setLive(true);
        }
      })
      .catch(() => { /* keep sample data */ });
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={card}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>Recent Campaigns</h3>
        {live && (
          <span style={{ fontSize: '11px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            Live Data
          </span>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
              <th style={{ ...thStyle, textAlign: 'left' }}>Campaign Name</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Platform</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Spend</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Impressions</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Clicks</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>CTR</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>CPC</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>ROI</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'default' }}>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{campaign.name}</td>
                <td style={tdStyle}>
                  <PlatformBadge platform={campaign.platform} />
                </td>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: campaign.status === 'active' ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
                    color: campaign.status === 'active' ? 'var(--green)' : 'var(--muted)',
                  }}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>{campaign.spend}</td>
                <td style={{ ...tdMuted, textAlign: 'right' }}>{campaign.impressions.toLocaleString()}</td>
                <td style={{ ...tdMuted, textAlign: 'right' }}>{campaign.clicks.toLocaleString()}</td>
                <td style={{ ...tdMuted, textAlign: 'right' }}>{campaign.ctr}</td>
                <td style={{ ...tdMuted, textAlign: 'right' }}>{campaign.cpc}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500, color: 'var(--green)' }}>{campaign.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
