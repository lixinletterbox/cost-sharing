export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
};

export type Event = {
  id: string;
  name: string;
  description?: string;
  currency: string;
  exchange_rates: Record<string, number>; // e.g. { EUR: 0.93 } when default is USD
  created_at: string;
  created_by: string;
};

export type Member = {
  id: string;
  event_id: string;
  profile_id?: string;
  name: string;
  default_weight: number;
  is_admin: boolean;
};

export type Expense = {
  id: string;
  event_id: string;
  amount: number;
  currency: string;
  category: string;
  payer_member_id: string;
  date: string;
  note?: string;
  created_by: string;
};

export type ExpenseSplit = {
  id: string;
  expense_id: string;
  member_id: string;
  weight: number;
};

export type Category =
  | 'flight'
  | 'hotel'
  | 'rental car'
  | 'gas'
  | 'parking'
  | 'restaurant'
  | 'grocery'
  | 'ticket'
  | 'other';

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: 'JP¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: 'CN¥', name: 'Chinese Yuan' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];
