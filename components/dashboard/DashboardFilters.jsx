'use client';

import { useState } from 'react';

export default function DashboardFilters({ onFilterChange }) {
  const [dateRange, setDateRange] = useState('7days');
  const [platform, setPlatform] = useState('all');

  const handleDateChange = (range) => {
    setDateRange(range);
    onFilterChange({ dateRange: range, platform });
  };

  const handlePlatformChange = (plat) => {
    setPlatform(plat);
    onFilterChange({ dateRange, platform: plat });
  };

  const btnBase = {
    padding: '7px 14px',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '13px',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s',
  };

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {/* Date Range */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Range</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['7days', '30days', '90days', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => handleDateChange(range)}
                style={{
                  ...btnBase,
                  background: dateRange === range ? 'var(--accent)' : 'var(--bg3)',
                  color: dateRange === range ? '#fff' : 'var(--muted)',
                }}
              >
                {range === '7days'
                  ? 'Last 7 days'
                  : range === '30days'
                  ? 'Last 30 days'
                  : range === '90days'
                  ? 'Last 90 days'
                  : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Filter */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</label>
          <select
            value={platform}
            onChange={(e) => handlePlatformChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--bg3)',
              color: 'var(--text)',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option value="all">All Platforms</option>
            <option value="google">Google Ads</option>
            <option value="meta">Meta</option>
            <option value="tiktok">TikTok</option>
            <option value="snapchat">Snapchat</option>
          </select>
        </div>

        {/* Custom Date Range (shown when custom is selected) */}
        {dateRange === 'custom' && (
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>From</label>
                <input type="date" style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg3)', color: 'var(--text)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>To</label>
                <input type="date" style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg3)', color: 'var(--text)' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
