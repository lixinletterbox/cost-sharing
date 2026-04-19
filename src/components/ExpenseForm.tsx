import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Member, Expense, Category } from '../types';
import { X, Save, AlertCircle, Plane, Hotel, Car, Fuel, CircleParking, Utensils, ShoppingBasket, Ticket, MoreHorizontal } from 'lucide-react';

import { getLocalDateString } from '../utils/dateUtils';

interface ExpenseFormProps {
  eventId: string;
  members: Member[];
  editingExpense?: Expense;
  onClose: () => void;
  onRefresh: () => void;
}

const CATEGORIES: Category[] = [
  'flight', 'hotel', 'rental car', 'gas', 'parking', 'restaurant', 'grocery', 'ticket', 'other'
];

export default function ExpenseForm({ eventId, members, editingExpense, onClose, onRefresh }: ExpenseFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [amount, setAmount] = useState(editingExpense?.amount?.toString() || '');
  const [category, setCategory] = useState<Category>((editingExpense?.category as Category) || 'other');
  const currentUserMemberId = members.find(m => m.profile_id === user?.id)?.id;
  const [payerId, setPayerId] = useState(editingExpense?.payer_member_id || currentUserMemberId || members[0]?.id || '');
  const [date, setDate] = useState(editingExpense?.date || getLocalDateString());
  const [note, setNote] = useState(editingExpense?.note || '');
  
  const [participants, setParticipants] = useState<Record<string, { selected: boolean; weight: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialParticipants: Record<string, { selected: boolean; weight: string }> = {};
    
    if (editingExpense) {
      fetchSplits(editingExpense.id);
    } else {
      members.forEach(m => {
        initialParticipants[m.id] = { 
          selected: true, 
          weight: m.default_weight.toString() 
        };
      });
      setParticipants(initialParticipants);
    }
  }, [editingExpense, members]);

  const fetchSplits = async (expenseId: string) => {
    const { data } = await supabase
      .from('expense_splits')
      .select('*')
      .eq('expense_id', expenseId);

    if (data) {
      const pMap: Record<string, { selected: boolean; weight: string }> = {};
      members.forEach(m => {
        const split = data.find(s => s.member_id === m.id);
        pMap[m.id] = {
          selected: !!split,
          weight: split ? split.weight.toString() : m.default_weight.toString()
        };
      });
      setParticipants(pMap);
    }
  };

  const handleToggleParticipant = (memberId: string) => {
    setParticipants(prev => ({
      ...prev,
      [memberId]: { 
        ...prev[memberId], 
        selected: !prev[memberId].selected 
      }
    }));
  };

  const handleWeightChange = (memberId: string, weight: string) => {
    setParticipants(prev => ({
      ...prev,
      [memberId]: { 
        ...prev[memberId], 
        weight 
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const selectedParticipants = Object.entries(participants)
      .filter(([_, data]) => data.selected)
      .map(([id, data]) => ({ member_id: id, weight: Number(data.weight) }));

    if (selectedParticipants.length === 0) {
      setError(t('atLeastOneParticipant'));
      setLoading(false);
      return;
    }

    try {
      let expenseId = editingExpense?.id;

      if (editingExpense) {
        const { error: expError } = await supabase
          .from('expenses')
          .update({
            amount: Number(amount),
            category,
            payer_member_id: payerId,
            date,
            note
          })
          .eq('id', editingExpense.id);

        if (expError) throw expError;
        await supabase.from('expense_splits').delete().eq('expense_id', expenseId);
      } else {
        const { data: newExp, error: expError } = await supabase
          .from('expenses')
          .insert({
            event_id: eventId,
            amount: Number(amount),
            category,
            payer_member_id: payerId,
            date,
            note,
            created_by: user.id
          })
          .select()
          .single();

        if (expError) throw expError;
        expenseId = newExp.id;
      }

      const { error: splitError } = await supabase
        .from('expense_splits')
        .insert(
          selectedParticipants.map(p => ({
            expense_id: expenseId,
            member_id: p.member_id,
            weight: p.weight
          }))
        );

      if (splitError) throw splitError;

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
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{editingExpense ? t('editExpense') : t('addExpense')}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">{t('amount')}</label>
              <input 
                type="number" 
                step="0.01" 
                className="input-field" 
                placeholder="0.00" 
                required 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">{t('category')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ color: 'var(--primary-hover)' }}>
                  {category === 'flight' && <Plane size={20} />}
                  {category === 'hotel' && <Hotel size={20} />}
                  {category === 'rental car' && <Car size={20} />}
                  {category === 'gas' && <Fuel size={20} />}
                  {category === 'parking' && <CircleParking size={20} />}
                  {category === 'restaurant' && <Utensils size={20} />}
                  {category === 'grocery' && <ShoppingBasket size={20} />}
                  {category === 'ticket' && <Ticket size={20} />}
                  {category === 'other' && <MoreHorizontal size={20} />}
                </div>
                <select 
                  className="input-field" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {/* @ts-ignore */}
                      {t(c)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">{t('payer')}</label>
              <select 
                className="input-field" 
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">{t('date')}</label>
              <input 
                type="date" 
                className="input-field" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">{t('descriptionLabel')} ({t('optional')})</label>
              <input 
                type="text"
                className="input-field" 
                placeholder={t('descriptionPlaceholder')} 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label" style={{ marginBottom: '1rem' }}>{t('participants')}</label>
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem', padding: '1rem' }}>
              {members.map(m => (
                <div key={m.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', 
                  opacity: participants[m.id]?.selected ? 1 : 0.5 
                }}>
                  <input 
                    type="checkbox" 
                    checked={participants[m.id]?.selected || false}
                    onChange={() => handleToggleParticipant(m.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ flex: 1 }}>{m.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t('weight')}</span>
                    <input 
                      type="number"
                      step="0.1"
                      className="input-field"
                      style={{ width: '80px', padding: '0.4rem' }}
                      value={participants[m.id]?.weight || ''}
                      onChange={(e) => handleWeightChange(m.id, e.target.value)}
                      disabled={!participants[m.id]?.selected}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              <Save size={18} />
              {loading ? t('processing') : t('saveExpense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
