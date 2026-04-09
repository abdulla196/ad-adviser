'use client';

import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { auth, AUTH_STORAGE_EVENT } from '../../lib/apiClient';

type AuthMode = 'login' | 'register';

type BasicFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneCountryCode: string;
  phoneNumber: string;
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(17,17,24,0.92)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: 28,
  boxShadow: '0 28px 80px rgba(0,0,0,0.35)',
  backdropFilter: 'blur(14px)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--muted)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--bg3)',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
};

const primaryButton: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  border: 'none',
  borderRadius: 14,
  background: 'linear-gradient(135deg, #7c6af7 0%, #1877F2 100%)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
};

const subtleButton: React.CSSProperties = {
  width: '100%',
  padding: 0,
  borderRadius: 999,
  border: '1px solid rgba(15,23,42,0.18)',
  background: '#ffffff',
  color: '#111827',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  minHeight: 54,
  overflow: 'hidden',
};

const dividerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  color: 'var(--muted)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const dividerLineStyle: React.CSSProperties = {
  flex: 1,
  height: 1,
  background: 'var(--border)',
};

const initialBasicForm: BasicFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phoneCountryCode: '+20',
  phoneNumber: '',
};

export default function AuthScreen({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [basicForm, setBasicForm] = useState<BasicFormState>(initialBasicForm);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isRegister = mode === 'register';
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const hasGoogleClientId = googleClientId.length > 0;

  const persistAuth = (payload: { token: string; user: unknown }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adAdviserAuthToken', payload.token);
      localStorage.setItem('adAdviserUser', JSON.stringify(payload.user));
      window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
    }
  };

  const updateBasicField = (field: keyof BasicFormState, value: string) => {
    setBasicForm((current) => ({ ...current, [field]: value }));
  };

  const submitBasic = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading('basic');
    setError('');
    setSuccess('');

    try {
      const payload = isRegister
        ? await auth.registerBasic(basicForm)
        : await auth.loginBasic({
            email: basicForm.email,
            password: basicForm.password,
          });

      persistAuth(payload);
      setSuccess(isRegister ? 'Account created successfully.' : 'Logged in successfully.');
      router.push('/');
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request failed');
    } finally {
      setLoading(null);
    }
  };

  const submitGoogle = async (idToken: string) => {
    setLoading('google');
    setError('');
    setSuccess('');

    try {
      const payload = isRegister
        ? await auth.registerGoogle({ idToken })
        : await auth.loginGoogle({ idToken });

      persistAuth(payload);
      setSuccess(isRegister ? 'Google registration succeeded.' : 'Google login succeeded.');
      router.push('/');
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Request failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(320px, 520px) minmax(320px, 1fr)', gap: 24, padding: 24 }}>
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #7c6af7 0%, #a78bfa 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>A</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700 }}>Ad Adviser</div>
          </div>

          <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, lineHeight: 1.05, marginBottom: 14 }}>
            {isRegister ? 'Register to launch campaigns faster.' : 'Login to manage every ad account in one place.'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.7, marginBottom: 22 }}>
            {isRegister
              ? 'Use email and password, or create your account directly with Google.'
              : 'Use the same backend login APIs for email/password, or continue with Google.'}
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            {[
              'Email/password login and registration',
              'Google login and registration',
              'JWT token persistence in localStorage',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', fontSize: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg, #34d399 0%, #22c55e 100%)' }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 32, color: 'var(--muted)', fontSize: 13 }}>
          {isRegister ? 'Already have an account?' : 'Need a new account?'}{' '}
          <Link href={isRegister ? '/login' : '/register'} style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 700 }}>
            {isRegister ? 'Login here' : 'Register here'}
          </Link>
        </div>
      </div>

      <div style={{ ...cardStyle, alignSelf: 'center', maxWidth: 720, width: '100%', justifySelf: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, marginBottom: 6 }}>{isRegister ? 'Register' : 'Login'}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              {isRegister ? 'Create a user via backend auth API.' : 'Authenticate with the backend auth API.'}
            </p>
          </div>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 13 }}>Back to dashboard</Link>
        </div>

        {error && <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.22)', color: '#fda4af', fontSize: 13 }}>{error}</div>}
        {success && <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.22)', color: '#6ee7b7', fontSize: 13 }}>{success}</div>}

        <div style={{ marginBottom: 18 }}>
          {hasGoogleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <div style={subtleButton}>
                <GoogleLogin
                  text={isRegister ? 'signup_with' : 'signin_with'}
                  theme="outline"
                  shape="pill"
                  size="large"
                  width="420"
                  logo_alignment="left"
                  onSuccess={(credentialResponse) => {
                    if (!credentialResponse.credential) {
                      setError('Google sign-in did not return a credential token.');
                      return;
                    }

                    submitGoogle(credentialResponse.credential);
                  }}
                  onError={() => setError('Google sign-in failed. Check NEXT_PUBLIC_GOOGLE_CLIENT_ID and allowed origins.')}
                />
              </div>
            </GoogleOAuthProvider>
          ) : (
            <div style={{ padding: '14px 16px', borderRadius: 999, border: '1px solid rgba(250,204,21,0.25)', background: 'rgba(250,204,21,0.08)', color: '#fde68a', fontSize: 13, lineHeight: 1.6 }}>
              Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in the frontend environment to enable Google login and registration.
            </div>
          )}
        </div>

        <div style={{ ...dividerStyle, marginBottom: 18 }}>
          <span style={dividerLineStyle} />
          <span>Or use email</span>
          <span style={dividerLineStyle} />
        </div>

        <div>
          <form onSubmit={submitBasic} style={{ display: 'grid', gap: 14 }}>
            {isRegister && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input value={basicForm.firstName} onChange={(event) => updateBasicField('firstName', event.target.value)} style={inputStyle} placeholder="Abdulla" />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input value={basicForm.lastName} onChange={(event) => updateBasicField('lastName', event.target.value)} style={inputStyle} placeholder="Ahmed" />
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={basicForm.email} onChange={(event) => updateBasicField('email', event.target.value)} style={inputStyle} placeholder="name@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={basicForm.password} onChange={(event) => updateBasicField('password', event.target.value)} style={inputStyle} placeholder="Minimum 8 characters" />
            </div>

            {isRegister && (
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Code</label>
                  <input value={basicForm.phoneCountryCode} onChange={(event) => updateBasicField('phoneCountryCode', event.target.value)} style={inputStyle} placeholder="+20" />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={basicForm.phoneNumber} onChange={(event) => updateBasicField('phoneNumber', event.target.value)} style={inputStyle} placeholder="1012345678" />
                </div>
              </div>
            )}

            <button type="submit" style={primaryButton} disabled={loading === 'basic'}>
              {loading === 'basic' ? 'Please wait...' : isRegister ? 'Create account' : 'Login with email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}