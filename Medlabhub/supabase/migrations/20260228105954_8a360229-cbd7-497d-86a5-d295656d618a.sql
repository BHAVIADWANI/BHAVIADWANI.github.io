
-- Create audit log table for PHI access tracking
CREATE TABLE public.phi_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text
);

-- Enable RLS
ALTER TABLE public.phi_access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins or the user themselves can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON public.phi_access_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert audit logs (via trigger running as definer)
CREATE POLICY "System can insert audit logs"
  ON public.phi_access_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create trigger function to log PHI access
CREATE OR REPLACE FUNCTION public.log_phi_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.phi_access_logs (user_id, record_id, action)
  VALUES (
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    TG_OP
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach triggers to identification_records
CREATE TRIGGER audit_phi_insert
  AFTER INSERT ON public.identification_records
  FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();

CREATE TRIGGER audit_phi_update
  AFTER UPDATE ON public.identification_records
  FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();

CREATE TRIGGER audit_phi_delete
  AFTER DELETE ON public.identification_records
  FOR EACH ROW EXECUTE FUNCTION public.log_phi_access();
