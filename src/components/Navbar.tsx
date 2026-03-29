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

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <nav className="container" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }} className="logo">
          TripSplit
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={toggleLanguage} 
            className="btn btn-ghost" 
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', gap: '0.4rem' }}
          >
            <Globe size={14} />
            {language === 'en' ? '中文' : 'EN'}
          </button>

          {user && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)' }}>
                <User size={18} />
                <span style={{ fontSize: '0.875rem' }}>{profile?.full_name || user.email}</span>
              </div>
              
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
