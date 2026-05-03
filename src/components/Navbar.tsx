import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, User, Globe } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const languages = [
    { code: 'en', flagCode: 'us', title: 'English' },
    { code: 'zh', flagCode: 'cn', title: '中文' },
    { code: 'ja', flagCode: 'jp', title: '日本語' }
  ] as const;

  return (
    <nav className="container" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }} className="logo">
          TripSplit
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/contact" className="btn btn-ghost" style={{ textDecoration: 'none', padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>
            {t('contactUs')}
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--glass-bg)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
            <Globe size={14} style={{ color: 'var(--text-dim)', margin: '0 0.25rem' }} />
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                title={lang.title}
                style={{
                  background: language === lang.code ? 'var(--primary-main)' : 'transparent',
                  border: 'none',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: language === lang.code ? 1 : 0.6
                }}
              >
                <img 
                  src={`https://flagcdn.com/w20/${lang.flagCode}.png`} 
                  srcSet={`https://flagcdn.com/w40/${lang.flagCode}.png 2x`}
                  width="20" 
                  alt={lang.title} 
                  style={{ borderRadius: '2px', display: 'block' }}
                />
              </button>
            ))}
          </div>

          {user && (
            <>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none', transition: 'opacity 0.2s' }} className="hover-opacity">
                <User size={18} />
                <span style={{ fontSize: '0.875rem' }}>{profile?.full_name || user.email}</span>
              </Link>
              
              <button 
                onClick={handleSignOut} 
                className="btn btn-ghost" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
