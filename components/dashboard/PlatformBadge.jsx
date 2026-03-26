export default function PlatformBadge({ platform }) {
  const platformConfig = {
    google: { bg: 'rgba(66,133,244,0.15)', text: '#4285F4', label: 'Google Ads' },
    meta: { bg: 'rgba(24,119,242,0.15)', text: '#1877F2', label: 'Meta' },
    tiktok: { bg: 'rgba(255,255,255,0.08)', text: '#f0eff5', label: 'TikTok' },
    snapchat: { bg: 'rgba(255,252,0,0.15)', text: '#FFFC00', label: 'Snapchat' },
  };

  const config = platformConfig[platform?.toLowerCase()] || platformConfig.google;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500,
      background: config.bg,
      color: config.text,
    }}>
      {config.label}
    </span>
  );
}
