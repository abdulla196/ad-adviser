'use client';

import CampaignTable from '../../components/campaigns/CampaignTable';

export default function CampaignsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">Manage all your advertising campaigns</p>
        </div>
      </div>
      <CampaignTable />
    </div>
  );
}
