import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [captchaNum1, setCaptchaNum1] = useState(Math.floor(Math.random() * 10) + 1);
  const [captchaNum2, setCaptchaNum2] = useState(Math.floor(Math.random() * 10) + 1);
  const [userCaptcha, setUserCaptcha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const navigate = useNavigate();
  const { t } = useLanguage();

  const isPasswordStrong = (pwd: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pwd);
    return pwd.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // --- Forgot Password Flow ---
    if (forgotPasswordMode) {
      if (!email) {
        setError(t('email') + ' required');
        setLoading(false);
        return;
      }
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
        setSuccess(t('resetLinkSent'));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    // -----------------------------

    if (!isLogin && password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    if (!isLogin && !isPasswordStrong(password)) {
      setError(t('passwordTooWeak'));
      setLoading(false);
      return;
    }

    if (!isLogin && parseInt(userCaptcha) !== (captchaNum1 + captchaNum2)) {
      setError(t('captchaError'));
      setLoading(false);
      // Generate new captcha on fail
      setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
      setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
      setUserCaptcha('');
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="glass-card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
          <button
            type="button"
            className={`btn ${isLogin && !forgotPasswordMode ? 'text-white' : 'text-dim'}`}
            onClick={() => {
              setIsLogin(true);
              setForgotPasswordMode(false);
              setError(null);
              setSuccess(null);
            }}
            style={{ flex: 1, padding: '1rem', border: 'none', background: 'transparent' }}
          >
            {t('login')}
          </button>
          <button
            type="button"
            className={`btn ${!isLogin && !forgotPasswordMode ? 'text-white' : 'text-dim'}`}
            onClick={() => {
              setIsLogin(false);
              setForgotPasswordMode(false);
              setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
              setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
              setUserCaptcha('');
              setError(null);
              setSuccess(null);
            }}
            style={{ flex: 1, padding: '1rem', border: 'none', background: 'transparent' }}
          >
            {t('signup')}
          </button>
        </div>

        <form onSubmit={handleAuth}>
          {forgotPasswordMode && (
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 600 }}>
              {t('resetPassword')}
            </h2>
          )}

          <AnimatePresence mode="wait">
            {!isLogin && !forgotPasswordMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="input-group"
              >
                <label className="input-label">{t('fullName')}</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="John Doe"
                    required={!isLogin}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <label className="input-label">{t('email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="name@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <AnimatePresence>
            {!forgotPasswordMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="input-group"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>{t('password')}</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordMode(true);
                        setError(null);
                        setSuccess(null);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                    >
                      {t('forgotPassword')}
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                  <input
                    type="password"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    required={!forgotPasswordMode}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isLogin && !forgotPasswordMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="input-group"
              >
                <label className="input-label">{t('confirmPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                  <input
                    type="password"
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    required={!isLogin}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isLogin && !forgotPasswordMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="input-group"
              >
                <label className="input-label">{t('humanVerification')}: {captchaNum1} + {captchaNum2} = ?</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="0"
                  required={!isLogin && !forgotPasswordMode}
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
          {success && <p style={{ color: '#34d399', fontSize: '0.875rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '0.5rem' }}>{success}</p>}

          <button className="btn btn-primary" style={{ width: '100%', marginBottom: forgotPasswordMode ? '1rem' : '0' }} disabled={loading}>
            {loading ? t('processing') : forgotPasswordMode ? t('sendResetLink') : isLogin ? t('signIn') : t('createAccount')}
            {!loading && !forgotPasswordMode && (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
          </button>

          {forgotPasswordMode && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ width: '100%' }}
              onClick={() => {
                setForgotPasswordMode(false);
                setError(null);
                setSuccess(null);
              }}
            >
              {t('backToLogin')}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
