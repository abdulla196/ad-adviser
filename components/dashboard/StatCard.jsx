export default function StatCard({ icon: Icon, label, value, change, changeType = 'positive' }) {
  const isPositive = changeType === 'positive';
  
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 500 }}>{label}</p>
          <p style={{ color: 'var(--text)', fontSize: '24px', fontWeight: 700, marginTop: '8px', fontFamily: 'Syne, sans-serif' }}>{value}</p>
          {change && (
            <p style={{ fontSize: '13px', marginTop: '8px', color: isPositive ? 'var(--green)' : 'var(--red)' }}>
              {isPositive ? '↑' : '↓'} {change}% from last period
            </p>
          )}
        </div>
        <div style={{
          background: 'rgba(124,106,247,0.12)',
          borderRadius: '10px',
          padding: '10px',
        }}>
          {Icon && <Icon style={{ width: '22px', height: '22px', color: 'var(--accent2)' }} />}
        </div>
      </div>
    </div>
  );
}
