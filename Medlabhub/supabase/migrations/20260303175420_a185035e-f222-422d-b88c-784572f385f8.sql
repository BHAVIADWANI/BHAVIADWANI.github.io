
-- Fix 1: Restore auth-based RLS policies on identification_records
DROP POLICY IF EXISTS "Public read access" ON public.identification_records;
DROP POLICY IF EXISTS "Public insert access" ON public.identification_records;
DROP POLICY IF EXISTS "Public update access" ON public.identification_records;
DROP POLICY IF EXISTS "Public delete access" ON public.identification_records;

CREATE POLICY "Users can view own records" ON public.identification_records
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON public.identification_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON public.identification_records
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON public.identification_records
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix 2: Restore auth-based RLS policies on phi_access_logs
DROP POLICY IF EXISTS "Public read access" ON public.phi_access_logs;
DROP POLICY IF EXISTS "Public insert access" ON public.phi_access_logs;

CREATE POLICY "Users can view own access logs" ON public.phi_access_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- No direct INSERT policy - inserts happen via SECURITY DEFINER trigger only

-- Fix 3: Restore auth-based RLS policies on flashcard_progress
DROP POLICY IF EXISTS "Public read access" ON public.flashcard_progress;
DROP POLICY IF EXISTS "Public insert access" ON public.flashcard_progress;
DROP POLICY IF EXISTS "Public update access" ON public.flashcard_progress;
DROP POLICY IF EXISTS "Public delete access" ON public.flashcard_progress;

CREATE POLICY "Users can view own flashcards" ON public.flashcard_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcards" ON public.flashcard_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcards" ON public.flashcard_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcards" ON public.flashcard_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix 4: Restore auth-based RLS policies on quiz_history
DROP POLICY IF EXISTS "Public read access" ON public.quiz_history;
DROP POLICY IF EXISTS "Public insert access" ON public.quiz_history;
DROP POLICY IF EXISTS "Public update access" ON public.quiz_history;
DROP POLICY IF EXISTS "Public delete access" ON public.quiz_history;

CREATE POLICY "Users can view own quiz history" ON public.quiz_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz history" ON public.quiz_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quiz history" ON public.quiz_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own quiz history" ON public.quiz_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix 5: Restore auth-based RLS policies on profiles
DROP POLICY IF EXISTS "Public read access" ON public.profiles;
DROP POLICY IF EXISTS "Public insert access" ON public.profiles;
DROP POLICY IF EXISTS "Public update access" ON public.profiles;
DROP POLICY IF EXISTS "Public delete access" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix 6: Update audit log trigger to require authentication
CREATE OR REPLACE FUNCTION public.log_phi_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated access to PHI not allowed';
  END IF;

  INSERT INTO public.phi_access_logs (user_id, record_id, action)
  VALUES (
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    TG_OP
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;
