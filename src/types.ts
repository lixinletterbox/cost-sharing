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
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: 'JP¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CNY', symbol: 'CN¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

export type EventRequest = {
  id: string;
  event_id: string;
  profile_id: string;
  status: 'pending' | 'approved' | 'denied';
  type: 'join_request' | 'invitation' | 'guest_link';
  alias?: string | null;
  message?: string | null;
  guest_member_id?: string | null;
  created_at: string;
  created_by: string;
  resolved_at?: string | null;
};

export type Notification = {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  message?: string;
  is_read: boolean;
  event_request_id?: string | null;
  event_request?: EventRequest | null;
  event_id?: string | null;
  event?: { id: string; name: string } | null;
  created_at: string;
};
