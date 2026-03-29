import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Event, Member, Expense, ExpenseSplit } from '../types';
import { 
  Plus, Users as UsersIcon, CreditCard, ChevronLeft, 
  Settings, Trash2, Edit2, AlertCircle, TrendingUp, User as UserIcon 
} from 'lucide-react';
import type { MemberBalance, Settlement } from '../utils/engine';
import { calculateBalances, suggestSettlements } from '../utils/engine';
import ExpenseForm from '../components/ExpenseForm';
import MemberForm from '../components/MemberForm';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  useEffect(() => {
    if (id) {
      fetchEventData();
    }
  }, [id]);

  const fetchEventData = async () => {
    try {
      const [eventRes, membersRes, expensesRes, splitsRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase.from('event_members').select('*').eq('event_id', id),
        supabase.from('expenses').select('*').eq('event_id', id).order('date', { ascending: false }),
        supabase.from('expense_splits').select('*')
      ]);

      if (eventRes.error) throw eventRes.error;
      setEvent(eventRes.data);
      setMembers(membersRes.data || []);
      setExpenses(expensesRes.data || []);
      
      const expenseIds = (expensesRes.data || []).map(e => e.id);
      setSplits((splitsRes.data || []).filter(s => expenseIds.includes(s.expense_id)));
    } catch (err) {
      console.error('Error fetching event data:', err);
    } finally {
      setLoading(false);
    }
  };

  const balances: MemberBalance[] = calculateBalances(expenses, splits, members);
  const settlements: Settlement[] = suggestSettlements(balances);
  const currentUserMember = members.find(m => m.profile_id === user?.id);
  const isAdmin = currentUserMember?.is_admin || event?.created_by === user?.id;

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm(t('deleteExpenseConfirm'))) return;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;
      setExpenses(expenses.filter(e => e.id !== expenseId));
      setSplits(splits.filter(s => s.expense_id !== expenseId));
    } catch (err) {
      console.error('Delete expense error:', err);
    }
  };

  if (loading) return <div className="container animate-pulse">{t('processing')}</div>;
  if (!event) return <div className="container">Event not found.</div>;

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/')} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{event.name}</h1>
            {event.description && (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {event.description}
              </p>
            )}
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              <UsersIcon size={14} /> {members.length} {t('members')} • <CreditCard size={14} /> {expenses.length} {t('expenses')}
            </p>
          </div>
        </div>
        
        {activeTab === 'expenses' && (
          <button className="btn btn-primary" onClick={() => { setEditingExpense(undefined); setShowExpenseForm(true); }}>
            <Plus size={20} />
            {t('addExpense')}
          </button>
        )}
      </header>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        {[
          { id: 'expenses', label: t('expenses'), icon: CreditCard },
          { id: 'balances', label: t('balances'), icon: TrendingUp },
          { id: 'members', label: t('memberTab'), icon: UsersIcon }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 1rem', border: 'none' }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'expenses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {expenses.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <AlertCircle size={32} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
                <p>{t('noEventsFound')}</p>
              </div>
            ) : (
              expenses.map(expense => {
                const payer = members.find(m => m.id === expense.payer_member_id);
                return (
                  <div key={expense.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div className="badge badge-purple" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {expense.category.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: 0 }}>{expense.description}</h4>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          Paid by <strong>{payer?.name}</strong> • {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.125rem' }}>
                        ${Number(expense.amount).toFixed(2)}
                      </div>
                      {(isAdmin || expense.created_by === user?.id) && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-ghost" 
                            style={{ padding: '0.4rem' }}
                            onClick={() => { setEditingExpense(expense); setShowExpenseForm(true); }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ padding: '0.4rem', color: 'var(--accent)' }}
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>{t('individualBalances')}</h3>
              <div className="glass-card" style={{ padding: 0 }}>
                {balances.map((balance, idx) => (
                  <div key={balance.memberId} style={{ 
                    padding: '1.25rem', 
                    borderBottom: idx === balances.length - 1 ? 'none' : '1px solid var(--glass-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{balance.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Paid: ${balance.paid.toFixed(2)} / {t('category')}: ${balance.share.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ 
                      fontWeight: 800, 
                      color: balance.net > 0 ? 'var(--secondary)' : balance.net < -0.01 ? 'var(--accent)' : 'inherit'
                    }}>
                      {balance.net > 0 ? '+' : ''}${balance.net.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>{t('settlementPlan')}</h3>
              <div className="glass-card" style={{ background: 'rgba(6, 182, 212, 0.05)' }}>
                {settlements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p style={{ color: 'var(--text-dim)' }}>{t('allSettled')}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {settlements.map((s, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-deep)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' 
                      }}>
                        <div style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>{s.fromName}</div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 800 }}>{t('pay')} ${s.amount.toFixed(2)}</span>
                          <div style={{ height: '2px', width: '100%', background: 'var(--glass-border)', position: 'relative', marginTop: '4px' }}>
                            <div style={{ position: 'absolute', right: '-4px', top: '-4px', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid var(--glass-border)' }}></div>
                          </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left', fontWeight: 600 }}>{s.toName}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{t('groupMembers')}</h3>
              {isAdmin && (
                <button className="btn btn-ghost" onClick={() => setShowMemberForm(true)}>
                  <Plus size={18} />
                  {t('addMember')}
                </button>
              )}
            </div>
            <div className="glass-card" style={{ padding: 0 }}>
              {members.map((member, idx) => (
                <div key={member.id} style={{ 
                  padding: '1.25rem', 
                  borderBottom: idx === members.length - 1 ? 'none' : '1px solid var(--glass-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserIcon size={16} style={{ color: member.profile_id ? 'var(--secondary)' : 'var(--text-dim)' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{member.name}</span>
                        {member.is_admin && <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>{t('admin')}</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {t('weight')}: {member.default_weight} • {member.profile_id ? t('registeredUser') : t('guest')}
                      </div>
                    </div>
                  </div>
                  {isAdmin && member.profile_id !== user?.id && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <Settings size={18} style={{ color: 'var(--text-dim)', cursor: 'pointer' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showExpenseForm && (
        <ExpenseForm 
          eventId={id!} 
          members={members} 
          editingExpense={editingExpense}
          onClose={() => { setShowExpenseForm(false); setEditingExpense(undefined); }}
          onRefresh={fetchEventData}
        />
      )}

      {showMemberForm && (
        <MemberForm 
          eventId={id!} 
          onClose={() => setShowMemberForm(false)}
          onRefresh={fetchEventData}
        />
      )}
    </div>
  );
}
