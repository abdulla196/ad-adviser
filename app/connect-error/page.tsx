'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function ConnectErrorContent() {
  const params = useSearchParams();
  const platform = params.get('platform') || 'platform';
  const message = params.get('error') || 'An unknown error occurred during the connection.';

  const platformLabels: Record<string, string> = {
    meta: 'Meta (Facebook)',
    tiktok: 'TikTok',
    snapchat: 'Snapchat',
    google: 'Google Ads',
  };

  const label = platformLabels[platform] || platform;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '48px 40px',
        textAlign: 'center',
        maxWidth: 440,
        width: '100%',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(248,113,113,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: 32,
        }}>
          ✕
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Connection Failed
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 12, lineHeight: 1.6 }}>
          Could not connect your <strong style={{ color: 'var(--text)' }}>{label}</strong> account.
        </p>
        <p style={{
          color: 'var(--red)',
          fontSize: 13,
          marginBottom: 32,
          background: 'rgba(248,113,113,0.08)',
          padding: '8px 16px',
          borderRadius: 8,
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/settings" style={{
            padding: '10px 24px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
          }}>
            Back to Settings
          </Link>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConnectError() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <ConnectErrorContent />
    </Suspense>
  );
}
