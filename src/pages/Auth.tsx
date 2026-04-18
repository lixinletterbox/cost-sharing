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
            className={`btn ${isLogin ? 'text-white' : 'text-dim'}`}
            onClick={() => setIsLogin(true)}
            style={{ flex: 1, padding: '1rem', border: 'none', background: 'transparent' }}
          >
            {t('login')}
          </button>
          <button 
            type="button"
            className={`btn ${!isLogin ? 'text-white' : 'text-dim'}`}
            onClick={() => {
              setIsLogin(false);
              setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
              setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
              setUserCaptcha('');
            }}
            style={{ flex: 1, padding: '1rem', border: 'none', background: 'transparent' }}
          >
            {t('signup')}
          </button>
        </div>

        <form onSubmit={handleAuth}>
          <AnimatePresence mode="wait">
            {!isLogin && (
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

          <div className="input-group">
            <label className="input-label">{t('password')}</label>
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

          <AnimatePresence>
            {!isLogin && (
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
            {!isLogin && (
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
                  required={!isLogin} 
                  value={userCaptcha}
                  onChange={(e) => setUserCaptcha(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p style={{ color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('processing') : isLogin ? t('signIn') : t('createAccount')}
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
