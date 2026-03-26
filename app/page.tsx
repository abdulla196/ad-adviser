'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  HandThumbUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import StatCard from '../components/dashboard/StatCard';
import { TrendChart, PlatformComparison, SpendDistribution } from '../components/dashboard/SpendChart';
import CampaignTable from '../components/campaigns/CampaignTable';
import DashboardFilters from '../components/dashboard/DashboardFilters';

export default function Dashboard() {
  const [filters, setFilters] = useState({ dateRange: '7days', platform: 'all' });

  return (
    <div>
      {/* Filters */}
      <DashboardFilters onFilterChange={setFilters} />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard icon={CurrencyDollarIcon} label="Total Spend" value="$8,550" change="12" changeType="positive" />
        <StatCard icon={EyeIcon} label="Impressions" value="354,800" change="8" changeType="positive" />
        <StatCard icon={ChartBarIcon} label="Clicks" value="8,699" change="5" changeType="positive" />
        <StatCard icon={HandThumbUpIcon} label="Avg CPC" value="$0.98" change="2" changeType="negative" />
        <StatCard icon={SparklesIcon} label="Total ROI" value="3.2x" change="15" changeType="positive" />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '24px' }}>
        <TrendChart />
        <SpendDistribution />
      </div>

      {/* Platform Comparison */}
      <div style={{ marginBottom: '24px' }}>
        <PlatformComparison />
      </div>

      {/* Campaign Table */}
      <CampaignTable />
    </div>
  );
}
