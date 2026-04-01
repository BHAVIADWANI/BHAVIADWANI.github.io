
-- Fix the log_phi_access trigger to handle anonymous (no auth) users
CREATE OR REPLACE FUNCTION public.log_phi_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.phi_access_logs (user_id, record_id, action)
  VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    COALESCE(NEW.id, OLD.id),
    TG_OP
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;
