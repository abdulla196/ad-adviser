'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const trendData = [
  { date: 'Jan 20', spend: 2400, impressions: 9400, clicks: 240 },
  { date: 'Jan 21', spend: 1398, impressions: 9210, clicks: 221 },
  { date: 'Jan 22', spend: 9800, impressions: 29200, clicks: 229 },
  { date: 'Jan 23', spend: 3908, impressions: 20000, clicks: 200 },
  { date: 'Jan 24', spend: 4800, impressions: 22181, clicks: 250 },
  { date: 'Jan 25', spend: 3800, impressions: 25250, clicks: 210 },
  { date: 'Jan 26', spend: 4300, impressions: 24521, clicks: 220 },
];

const platformData = [
  { platform: 'Google', spend: 12000 },
  { platform: 'Meta', spend: 8500 },
  { platform: 'TikTok', spend: 6200 },
  { platform: 'Snapchat', spend: 4100 },
];

const spendDistribution = [
  { name: 'Google', value: 35 },
  { name: 'Meta', value: 25 },
  { name: 'TikTok', value: 22 },
  { name: 'Snapchat', value: 18 },
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

const chartCard = {
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

function TrendChart() {
  return (
    <div style={chartCard}>
      <h3 style={chartTitle}>Spend & Performance Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" stroke="#7a7990" fontSize={12} />
          <YAxis stroke="#7a7990" fontSize={12} />
          <Tooltip contentStyle={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0eff5' }} />
          <Legend wrapperStyle={{ color: '#7a7990', fontSize: '12px' }} />
          <Line type="monotone" dataKey="spend" stroke="#7c6af7" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="impressions" stroke="#34d399" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PlatformComparison() {
  return (
    <div style={chartCard}>
      <h3 style={chartTitle}>Spend by Platform</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={platformData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="platform" stroke="#7a7990" fontSize={12} />
          <YAxis stroke="#7a7990" fontSize={12} />
          <Tooltip contentStyle={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0eff5' }} />
          <Bar dataKey="spend" fill="#7c6af7" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SpendDistribution() {
  return (
    <div style={chartCard}>
      <h3 style={chartTitle}>Spend Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={spendDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} ${value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {spendDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0eff5' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export { TrendChart, PlatformComparison, SpendDistribution };
