import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import type { Member } from '../types';
import { X, Shield, AlertCircle, Save, User as UserIcon, Search, Check, Loader, Mail, Trash2 } from 'lucide-react';
import type { Profile } from '../types';

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
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  useEffect(() => {
    if (member.profile_id) {
      const fetchEmail = async () => {
        try {
          const { data, error: profileErr } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', member.profile_id)
            .single();
          if (profileErr) throw profileErr;
          if (data) setRegisteredEmail(data.email);
        } catch (err) {
          console.error('Error fetching registered user email:', err);
        }
      };
      fetchEmail();
    }
  }, [member.profile_id]);

  // Guest linking state
  const [searchEmail, setSearchEmail] = useState('');
  const [foundProfile, setFoundProfile] = useState<Profile | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [originalGuestName] = useState(member.name);
  const [useRegisteredName, setUseRegisteredName] = useState(false);

  const handleUserSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    setFoundProfile(null);

    try {
      const { data, error: searchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', searchEmail.trim().toLowerCase())
        .maybeSingle();

      if (searchErr) throw searchErr;
      if (!data) {
        setSearchError(t('userNotFound'));
      } else {
        setFoundProfile(data);
        // Default to showing user name if admin wants
        // But user said "give an option to still use the name of the guest"
        // so we start with useRegisteredName = false by default.
      }
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };



  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData: any = {
        name: name.trim(),
        default_weight: Number(weight),
        is_admin: isAdmin,
      };

      if (!member.profile_id && foundProfile) {
        updateData.profile_id = foundProfile.id;
      }

      const { error: updateError } = await supabase
        .from('event_members')
        .update(updateData)
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

  const handleDelete = async () => {
    if (!window.confirm(t('deleteMemberConfirm'))) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Check if member has paid for any expenses
      const { data: expenses, error: expError } = await supabase
        .from('expenses')
        .select('id')
        .eq('payer_member_id', member.id)
        .limit(1);

      if (expError) throw expError;

      if (expenses && expenses.length > 0) {
        throw new Error(t('cannotDeleteMemberWithExpenses'));
      }

      // 2. Delete the member
      const { error: deleteError } = await supabase
        .from('event_members')
        .delete()
        .eq('id', member.id);

      if (deleteError) throw deleteError;

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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {member.profile_id ? (
                <>
                  {t('registeredUser')}
                  {registeredEmail && (
                    <>
                      <Mail size={12} style={{ opacity: 0.6 }} />
                      <span style={{ opacity: 0.8 }}>{registeredEmail}</span>
                    </>
                  )}
                </>
              ) : t('guest')}
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
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              <Save size={18} />
              {loading ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: '100%', color: 'var(--accent)', justifyContent: 'center' }}
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 size={16} />
            {t('delete')}
          </button>
        </div>

        {/* Link to Registered User (only for guests) */}
        {!member.profile_id && !foundProfile && (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-dim)' }}>{t('linkToUser')}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', height: '38px', fontSize: '0.85rem' }}
                  placeholder={t('userEmail')}
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUserSearch())}
                />
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '0 1rem', height: '38px' }}
                disabled={searchLoading || !searchEmail.trim()}
                onClick={handleUserSearch}
              >
                {searchLoading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
            </div>
            {searchError && (
              <div style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={12} />
                {searchError}
              </div>
            )}
          </div>
        )}

        {/* Selected Profile Preview */}
        {!member.profile_id && foundProfile && (
          <div style={{
            marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem', background: 'rgba(var(--secondary-rgb), 0.1)',
              borderRadius: '0.5rem', border: '1px solid rgba(var(--secondary-rgb), 0.2)'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--secondary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white'
              }}>
                <Check size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{foundProfile.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{foundProfile.email}</div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ padding: '0.25rem', height: 'auto' }}
                onClick={() => {
                  setFoundProfile(null);
                  setName(originalGuestName);
                  setUseRegisteredName(false);
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn ${useRegisteredName ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                onClick={() => {
                  setUseRegisteredName(true);
                  setName(foundProfile.full_name);
                }}
              >
                <div style={{ width: '16px', display: 'flex', justifyContent: 'center', marginRight: '0.5rem' }}>
                  {useRegisteredName && <Check size={14} />}
                </div>
                {t('useRegisteredName')}
              </button>
              <button
                type="button"
                className={`btn ${!useRegisteredName ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.5rem 0.75rem' }}
                onClick={() => {
                  setUseRegisteredName(false);
                  setName(originalGuestName);
                }}
              >
                <div style={{ width: '16px', display: 'flex', justifyContent: 'center', marginRight: '0.5rem' }}>
                  {!useRegisteredName && <Check size={14} />}
                </div>
                {t('keepGuestName')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
