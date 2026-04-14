import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { X, UserPlus, Search, AlertCircle, Shield } from 'lucide-react';

interface MemberFormProps {
  eventId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MemberForm({ eventId, onClose, onRefresh }: MemberFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [weight, setWeight] = useState('1');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState<'guest' | 'user'>('guest');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let profileId: string | undefined = undefined;

      if (linkMode === 'user' && email.trim()) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('email', email.toLowerCase())
          .limit(1);

        if (profileError) throw profileError;
        
        if (!profiles || profiles.length === 0) {
          throw new Error(t('userNotFound'));
        }
        
        profileId = profiles[0].id;
        if (!name.trim()) setName(profiles[0].full_name);
      }

      const { error: memberError } = await supabase
        .from('event_members')
        .insert({
          event_id: eventId,
          profile_id: profileId,
          name: name.trim(),
          default_weight: Number(weight),
          is_admin: isAdmin
        });

      if (memberError) {
        if (memberError.code === '23505') {
          throw new Error(t('alreadyMember'));
        }
        throw memberError;
      }

      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{t('addMember')}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', padding: '0.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
          <button 
            type="button" 
            className={`btn ${linkMode === 'guest' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
            onClick={() => {
              setLinkMode('guest');
              setIsAdmin(false);
            }}
          >
            {t('guest')}
          </button>
          <button 
            type="button" 
            className={`btn ${linkMode === 'user' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
            onClick={() => setLinkMode('user')}
          >
            {t('registeredUser')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {linkMode === 'user' && (
            <div className="input-group">
              <label className="input-label">{t('userEmail')}</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                <input 
                  type="email" 
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem' }} 
                  placeholder="user@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">{t('displayName')}</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder={linkMode === 'user' ? 'Optional (uses user name if empty)' : 'e.g. Grandma, Dad, Sam'} 
              required={linkMode === 'guest'} 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: linkMode === 'user' ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">{t('defaultWeight')}</label>
              <input 
                type="number" 
                step="1" 
                min="0"
                className="input-field" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            
            {linkMode === 'user' && (
              <div className="input-group">
                <label className="input-label">{t('permissions')}</label>
                <button 
                  type="button"
                  className={`btn ${isAdmin ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem', fontSize: '0.875rem' }}
                  onClick={() => setIsAdmin(!isAdmin)}
                >
                  <Shield size={16} />
                  {isAdmin ? t('admin') : t('normalUser')}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              <UserPlus size={18} />
              {loading ? t('adding') : t('addMember')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
