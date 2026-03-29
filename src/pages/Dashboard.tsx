import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Event } from '../types';
import { Link } from 'react-router-dom';
import { Plus, Calendar, ChevronRight, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEventName.trim()) return;
    setError(null);

    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          name: newEventName,
          description: newEventDescription,
          created_by: user.id
        })
        .select()
        .single();

      if (eventError) throw eventError;

      const { error: memberError } = await supabase
        .from('event_members')
        .insert({
          event_id: event.id,
          profile_id: user.id,
          name: profile?.full_name || 'Admin',
          is_admin: true,
          default_weight: 1
        });

      if (memberError) throw memberError;

      setEvents([event, ...events]);
      setShowModal(false);
      setNewEventName('');
      setNewEventDescription('');
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please check your connection or permissions.');
    }
  };

  return (
    <div className="animate-fade">
      <header>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('tripsAndEvents')}</h1>
          <p style={{ color: 'var(--text-dim)' }}>{t('manageExpenses')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          {t('newEvent')}
        </button>
      </header>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="animate-pulse">{t('loadingEvents')}</div>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Calendar size={48} style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }} />
          <h3>{t('noEventsFound')}</h3>
          <p style={{ color: 'var(--text-dim)', margin: '1rem 0 2rem' }}>{t('startFirstTrip')}</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            {t('startAnEvent')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {events.map(event => (
            <Link key={event.id} to={`/event/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-card" style={{ height: '100%', transition: 'transform 0.2s ease', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>{event.name}</h3>
                  <ChevronRight size={20} style={{ color: 'var(--text-dim)' }} />
                </div>
                {event.description && (
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '1rem', lineClamp: 2, overflow: 'hidden' }}>
                    {event.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    {new Date(event.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>{t('createEvent')}</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="input-group">
                <label className="input-label">{t('eventName')}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Hawaii Summer Trip" 
                  autoFocus 
                  required 
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">{t('description')}</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="What's this event about?" 
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                />
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setShowModal(false); setError(null); }}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
