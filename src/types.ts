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
  description: string;
  amount: number;
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
