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
 * Deterministic hash function for consistency.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Calculates individual shares in cents and adjusts for rounding remainders fairly.
 */
export function calculateIndividualShares(
  expenseId: string,
  totalAmount: number,
  splits: { member_id: string; weight: number }[]
): Record<string, number> {
  if (splits.length === 0) return {};
  const totalWeight = splits.reduce((sum, s) => sum + Number(s.weight), 0);
  if (totalWeight === 0) return {};

  const amountInCents = Math.round(totalAmount * 100);
  
  // 1. Calculate base cents and fractional remainders
  const memberData = splits.map(s => {
    const exactCents = (amountInCents * Number(s.weight)) / totalWeight;
    const baseCents = Math.floor(exactCents);
    const remainder = exactCents - baseCents;
    return {
      member_id: s.member_id,
      baseCents,
      remainder
    };
  });

  const distributedBaseCents = memberData.reduce((sum, m) => sum + m.baseCents, 0);
  const remainingCents = amountInCents - distributedBaseCents;
  
  const sharesInCents: Record<string, number> = {};
  memberData.forEach(m => {
    sharesInCents[m.member_id] = m.baseCents;
  });

  // 2. Distribute remaining cents prioritized by remainder (higher fractional cent)
  if (remainingCents > 0) {
    const sortedMembers = [...memberData].sort((a, b) => {
      // Primary sort: Remainder (descending)
      if (Math.abs(a.remainder - b.remainder) > 0.0000001) {
        return b.remainder - a.remainder;
      }
      // Secondary sort: Deterministic hash for "fair" random tie-breaking
      const hashA = hashString(expenseId + a.member_id);
      const hashB = hashString(expenseId + b.member_id);
      return hashA - hashB || a.member_id.localeCompare(b.member_id);
    });

    for (let i = 0; i < remainingCents; i++) {
      const memberId = sortedMembers[i % sortedMembers.length].member_id;
      sharesInCents[memberId] += 1;
    }
  }

  // Convert back to decimal
  const result: Record<string, number> = {};
  for (const id in sharesInCents) {
    result[id] = sharesInCents[id] / 100;
  }
  return result;
}

/**
 * Converts an amount from a source currency to the default currency.
 * exchangeRates is a map of { [sourceCurrencyCode]: rateToDefaultCurrency }
 * e.g. if defaultCurrency is USD and { EUR: 1.08 } means 1 EUR = 1.08 USD
 */
export function convertToDefaultCurrency(
  amount: number,
  sourceCurrency: string,
  defaultCurrency: string,
  exchangeRates: Record<string, number>
): number {
  if (sourceCurrency === defaultCurrency) return amount;
  const rate = exchangeRates[sourceCurrency];
  if (rate === undefined) {
    console.warn(`No exchange rate found for ${sourceCurrency} -> ${defaultCurrency}. Treating as 1:1.`);
    return amount;
  }
  return amount * rate;
}

/**
 * Calculates the total net balance for each member in an event.
 * All amounts are converted to the event's default currency using the provided exchange rates.
 */
export function calculateBalances(
  expenses: Expense[],
  splits: ExpenseSplit[],
  members: Member[],
  defaultCurrency: string = 'USD',
  exchangeRates: Record<string, number> = {}
): MemberBalance[] {
  const balances: Record<string, { paid: number; share: number }> = {};

  // Initialize balances
  members.forEach(m => {
    balances[m.id] = { paid: 0, share: 0 };
  });

  // Calculate total paid by each member (converted to default currency)
  expenses.forEach(exp => {
    if (balances[exp.payer_member_id]) {
      const convertedAmount = convertToDefaultCurrency(
        Number(exp.amount),
        exp.currency || defaultCurrency,
        defaultCurrency,
        exchangeRates
      );
      balances[exp.payer_member_id].paid += convertedAmount;
    }
  });

  // Calculate total share for each member (converted to default currency)
  expenses.forEach(exp => {
    const itemSplits = splits.filter(s => s.expense_id === exp.id);
    if (itemSplits.length === 0) return;

    const convertedAmount = convertToDefaultCurrency(
      Number(exp.amount),
      exp.currency || defaultCurrency,
      defaultCurrency,
      exchangeRates
    );

    const shares = calculateIndividualShares(exp.id, convertedAmount, itemSplits);
    
    Object.entries(shares).forEach(([memberId, share]) => {
      if (balances[memberId]) {
        balances[memberId].share += share;
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
