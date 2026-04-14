import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import type { Member } from '../types';
import { X, Shield, AlertCircle, Save, User as UserIcon } from 'lucide-react';

interface MemberEditModalProps {
  member: Member;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MemberEditModal({ member, onClose, onRefresh }: MemberEditModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(member.name);
  const [weight, setWeight] = useState(String(member.default_weight));
  const [isAdmin, setIsAdmin] = useState(member.is_admin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('event_members')
        .update({
          name: name.trim(),
          default_weight: Number(weight),
          is_admin: isAdmin,
        })
        .eq('id', member.id);

      if (updateError) throw updateError;

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
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{t('editMember')}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Member type badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem', marginBottom: '1.5rem',
          background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UserIcon size={16} style={{ color: member.profile_id ? 'var(--secondary)' : 'var(--text-dim)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {member.profile_id ? t('registeredUser') : t('guest')}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          {/* Display Name */}
          <div className="input-group">
            <label className="input-label">{t('displayName')}</label>
            <input
              type="text"
              className="input-field"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Weight & Permissions row */}
          <div style={{ display: 'grid', gridTemplateColumns: member.profile_id ? '1fr 1fr' : '1fr', gap: '1rem' }}>
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

            {/* Admin toggle — only for registered users */}
            {member.profile_id && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              <Save size={18} />
              {loading ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
