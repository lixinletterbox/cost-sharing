-- Supabase Schema for TripSplit (Cost Sharing)

-- RESET DATABASE (Optional: Uncomment to wipe and restart)
DROP TABLE IF EXISTS expense_splits CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS event_members CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles: Extend existing auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Automated Profile Creation Function
-- This extracts the full_name from auth metadata and creates a public profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function after every new signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Events: The master record for a trip or event
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL
);

-- Event Members: Each event has multiple members (some are signed up users, some are guests)
CREATE TABLE event_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id), -- Null if it's a guest
  name TEXT NOT NULL, -- Name to display (e.g., "Guest A", "Dad")
  default_weight NUMERIC DEFAULT 1 NOT NULL, -- e.g. 2 for families
  is_admin BOOLEAN DEFAULT false NOT NULL, -- Can edit any item in event
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, profile_id) -- A user can't be added to the same event twice
);

-- Categories Enum (Optional, or just text)
-- flight, hotel, rental car, gas, parking, restaurant, grocery, ticket, other

-- Expenses: Individual spending items
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  payer_member_id UUID REFERENCES event_members(id) NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  note TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Expense Splits: How each expense is shared among event members
CREATE TABLE expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES event_members(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC DEFAULT 1 NOT NULL, -- The weight applied for this specific split
  UNIQUE(expense_id, member_id)
);

-- 6. Helper Security Definer Function to avoid infinite recursion in RLS
-- This function checks if a user is in an event without triggering the event's RLS loop
CREATE OR REPLACE FUNCTION public.is_event_member(e_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.events
    WHERE id = e_id AND created_by = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.event_members
    WHERE event_id = e_id AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Events Policies
-- FAST PATH: Always allow creator to see their own events immediately
CREATE POLICY "Select events" ON events FOR SELECT USING (created_by = auth.uid() OR is_event_member(id));
CREATE POLICY "Insert events" ON events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Update events" ON events FOR UPDATE USING (created_by = auth.uid());

-- 3. Event Members Policies
-- FAST PATH: Always allow users to see their own membership immediately
CREATE POLICY "Select members" ON event_members FOR SELECT USING (profile_id = auth.uid() OR is_event_member(event_id));
CREATE POLICY "Insert members" ON event_members FOR INSERT WITH CHECK (profile_id = auth.uid() OR is_event_member(event_id));
CREATE POLICY "Update members" ON event_members FOR UPDATE USING (profile_id = auth.uid() OR is_event_member(event_id));
CREATE POLICY "Delete members" ON event_members FOR DELETE USING (is_event_member(event_id));

-- 4. Expenses Policies
CREATE POLICY "Select expenses" ON expenses FOR SELECT USING (created_by = auth.uid() OR is_event_member(event_id));
CREATE POLICY "Insert expenses" ON expenses FOR INSERT WITH CHECK (created_by = auth.uid() OR is_event_member(event_id));
CREATE POLICY "Update expenses" ON expenses FOR UPDATE USING (created_by = auth.uid() OR is_event_member(event_id));
CREATE POLICY "Delete expenses" ON expenses FOR DELETE USING (created_by = auth.uid() OR is_event_member(event_id));

-- 5. Expense Splits Policies
CREATE POLICY "Select splits" ON expense_splits FOR SELECT USING (
  EXISTS (SELECT 1 FROM event_members WHERE id = member_id AND profile_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM expenses WHERE id = expense_id AND is_event_member(event_id))
);
CREATE POLICY "Manage splits" ON expense_splits FOR ALL USING (
  EXISTS (SELECT 1 FROM expenses WHERE id = expense_id AND is_event_member(event_id))
);
