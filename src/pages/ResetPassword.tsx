import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);

  const isPasswordStrong = (pwd: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pwd);
    return pwd.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from the hash fragment
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
        setChecking(false);
      }
    });

    // Also check if user already has a session (e.g. page was refreshed)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
      setChecking(false);
    };

    // Give Supabase a moment to process the hash, then check
    setTimeout(checkSession, 1500);

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    if (!isPasswordStrong(password)) {
      setError(t('passwordTooWeak'));
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      // Redirect to dashboard after a short delay
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="animate-fade" style={{ maxWidth: '450px', margin: '4rem auto' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="animate-pulse" style={{ fontSize: '1.125rem' }}>
            Verifying reset link...
          </div>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="animate-fade" style={{ maxWidth: '450px', margin: '4rem auto' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>
            This reset link is invalid or has expired.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>
            {t('backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="animate-fade" style={{ maxWidth: '450px', margin: '4rem auto' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <CheckCircle size={48} color="#34d399" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>{t('passwordUpdated')}</h2>
          <p style={{ color: 'var(--text-dim)' }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 600 }}>
          {t('resetPassword')}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '0.875rem' }}>
          {t('passwordTooWeak').split('.')[0]}.
        </p>

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">{t('newPassword')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">{t('confirmNewPassword')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('updating') : t('updatePassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
