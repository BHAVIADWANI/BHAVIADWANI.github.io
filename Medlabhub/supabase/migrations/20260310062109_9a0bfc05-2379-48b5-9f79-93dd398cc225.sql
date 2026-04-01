
-- Create subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'standard', 'premium');

-- Create subscription status enum  
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'pending');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '100 years'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create payment records table
CREATE TABLE public.payment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plan_type subscription_plan NOT NULL,
  payment_reference TEXT,
  verification_code TEXT,
  verification_code_expires_at TIMESTAMP WITH TIME ZONE,
  verification_code_used BOOLEAN NOT NULL DEFAULT false,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  activation_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Subscriptions RLS: users can read their own
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Payment records RLS: users can read/insert their own
CREATE POLICY "Users can view own payments" ON public.payment_records
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payment_records
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON public.payment_records
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- User roles RLS
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Security definer function to check admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Admin policies for viewing all data
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all payments" ON public.payment_records
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all payments" ON public.payment_records
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Function to get user subscription (security definer so edge functions can call it)
CREATE OR REPLACE FUNCTION public.get_user_subscription(_user_id UUID)
RETURNS TABLE(plan subscription_plan, status subscription_status, expiry_date TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.plan, 
         CASE WHEN s.expiry_date < now() THEN 'expired'::subscription_status ELSE s.status END,
         s.expiry_date
  FROM public.subscriptions s
  WHERE s.user_id = _user_id
  LIMIT 1
$$;

-- Auto-create free subscription on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, expiry_date)
  VALUES (NEW.id, 'free', 'active', now() + interval '100 years');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- Enable realtime for subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
