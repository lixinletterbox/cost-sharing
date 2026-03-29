import type { Expense, ExpenseSplit, Member } from '../types';

export interface MemberBalance {
  memberId: string;
  name: string;
  paid: number;
  share: number;
  net: number; // paid - share
}

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

/**
 * Calculates the total net balance for each member in an event.
 */
export function calculateBalances(
  expenses: Expense[],
  splits: ExpenseSplit[],
  members: Member[]
): MemberBalance[] {
  const balances: Record<string, { paid: number; share: number }> = {};

  // Initialize balances
  members.forEach(m => {
    balances[m.id] = { paid: 0, share: 0 };
  });

  // Calculate total paid by each member
  expenses.forEach(exp => {
    if (balances[exp.payer_member_id]) {
      balances[exp.payer_member_id].paid += Number(exp.amount);
    }
  });

  // Calculate total share for each member
  expenses.forEach(exp => {
    const itemSplits = splits.filter(s => s.expense_id === exp.id);
    if (itemSplits.length === 0) return;

    const totalWeight = itemSplits.reduce((sum, s) => sum + Number(s.weight), 0);
    const amountPerWeight = Number(exp.amount) / totalWeight;

    itemSplits.forEach(s => {
      if (balances[s.member_id]) {
        balances[s.member_id].share += Number(s.weight) * amountPerWeight;
      }
    });
  });

  return members.map(m => ({
    memberId: m.id,
    name: m.name,
    paid: balances[m.id].paid,
    share: balances[m.id].share,
    net: balances[m.id].paid - balances[m.id].share
  }));
}

/**
 * Minimizes transactions to settle all debts.
 */
export function suggestSettlements(balances: MemberBalance[]): Settlement[] {
  const settlements: Settlement[] = [];
  
  // Clone balances to avoid mutating original
  const netBalances = balances
    .map(b => ({ ...b }))
    .filter(b => Math.abs(b.net) > 0.01) // Filter out negligible amounts
    .sort((a, b) => a.net - b.net); // Sort debtors to creditors

  let i = 0; // Debtor pointer
  let j = netBalances.length - 1; // Creditor pointer

  while (i < j) {
    const debtor = netBalances[i];
    const creditor = netBalances[j];

    const amountToTransfer = Math.min(Math.abs(debtor.net), creditor.net);
    
    if (amountToTransfer > 0.01) {
      settlements.push({
        from: debtor.memberId,
        fromName: debtor.name,
        to: creditor.memberId,
        toName: creditor.name,
        amount: Number(amountToTransfer.toFixed(2))
      });
    }

    debtor.net += amountToTransfer;
    creditor.net -= amountToTransfer;

    if (Math.abs(debtor.net) < 0.01) i++;
    if (Math.abs(creditor.net) < 0.01) j--;
  }

  return settlements;
}
