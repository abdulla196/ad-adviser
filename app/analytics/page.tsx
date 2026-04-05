'use client';

const INTEGER_FORMATTER = new Intl.NumberFormat('en-US');
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US');

import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const card = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '20px',
};
const chartTitle = {
  fontFamily: 'Syne, sans-serif',
  fontWeight: 600,
  fontSize: '15px',
  color: 'var(--text)',
  marginBottom: '16px',
};
const tooltipStyle = {
  background: '#18181f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#f0eff5',
};

const dailyData = [
  { date: 'Mar 1', spend: 420, impressions: 12400, clicks: 310, conversions: 28, ctr: 2.5, roas: 3.2 },
  { date: 'Mar 5', spend: 510, impressions: 15600, clicks: 420, conversions: 35, ctr: 2.7, roas: 3.5 },
  { date: 'Mar 10', spend: 380, impressions: 11200, clicks: 290, conversions: 22, ctr: 2.6, roas: 2.8 },
  { date: 'Mar 15', spend: 620, impressions: 19800, clicks: 520, conversions: 48, ctr: 2.6, roas: 3.9 },
  { date: 'Mar 20', spend: 550, impressions: 17400, clicks: 460, conversions: 41, ctr: 2.6, roas: 3.6 },
  { date: 'Mar 25', spend: 680, impressions: 21200, clicks: 580, conversions: 52, ctr: 2.7, roas: 4.1 },
];

const platformPerf = [
  { platform: 'Google', impressions: 145000, clicks: 4200, spend: 3800, roas: 4.2 },
  { platform: 'Meta', impressions: 98000, clicks: 2800, spend: 2400, roas: 3.5 },
  { platform: 'TikTok', impressions: 72000, clicks: 1900, spend: 1600, roas: 2.9 },
  { platform: 'Snapchat', impressions: 39000, clicks: 980, spend: 750, roas: 2.1 },
];

const statBox = {
  padding: '16px',
  background: 'var(--bg3)',
  borderRadius: '10px',
  border: '1px solid var(--border)',
};

export default function AnalyticsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep dive into your advertising performance data</p>
        </div>
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Spend', value: '$8,550', change: '+12%', positive: true },
          { label: 'Conversions', value: '226', change: '+18%', positive: true },
          { label: 'Avg ROAS', value: '3.4x', change: '+8%', positive: true },
          { label: 'Avg CTR', value: '2.62%', change: '-0.3%', positive: false },
          { label: 'Avg CPC', value: '$0.98', change: '-5%', positive: true },
          { label: 'Conv. Rate', value: '3.8%', change: '+0.4%', positive: true },
        ].map((s) => (
          <div key={s.label} style={statBox}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: s.positive ? 'var(--green)' : 'var(--red)', marginTop: '4px' }}>
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Spend + Conversions Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
        <div style={card}>
          <h3 style={chartTitle}>Spend & Conversions</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#7a7990" fontSize={12} />
              <YAxis stroke="#7a7990" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="spend" stroke="#7c6af7" fill="url(#spendGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="conversions" stroke="#34d399" fill="url(#convGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h3 style={chartTitle}>ROAS Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#7a7990" fontSize={12} />
              <YAxis stroke="#7a7990" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="roas" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Comparison */}
      <div style={{ ...card, marginBottom: '24px' }}>
        <h3 style={chartTitle}>Platform Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={platformPerf}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="platform" stroke="#7a7990" fontSize={12} />
            <YAxis stroke="#7a7990" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="spend" fill="#7c6af7" radius={[4, 4, 0, 0]} name="Spend ($)" />
            <Bar dataKey="clicks" fill="#34d399" radius={[4, 4, 0, 0]} name="Clicks" />
            <Bar dataKey="conversions" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Conversions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Detail Table */}
      <div style={card}>
        <h3 style={chartTitle}>Platform Breakdown</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
              {['Platform', 'Impressions', 'Clicks', 'Spend', 'ROAS', 'CTR'].map((h) => (
                <th key={h} style={{
                  padding: '10px 14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  textAlign: h === 'Platform' ? 'left' : 'right',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {platformPerf.map((p) => (
              <tr key={p.platform} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{p.platform}</td>
                <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--muted)', textAlign: 'right' }}>{INTEGER_FORMATTER.format(p.impressions)}</td>
                <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--muted)', textAlign: 'right' }}>{INTEGER_FORMATTER.format(p.clicks)}</td>
                <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text)', fontWeight: 500, textAlign: 'right' }}>${CURRENCY_FORMATTER.format(p.spend)}</td>
                <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--green)', fontWeight: 500, textAlign: 'right' }}>{p.roas}x</td>
                <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--muted)', textAlign: 'right' }}>{(p.clicks / p.impressions * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
