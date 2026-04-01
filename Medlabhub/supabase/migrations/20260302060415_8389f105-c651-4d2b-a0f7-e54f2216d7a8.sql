
-- Drop restrictive policies and replace with permissive public access policies

-- identification_records
DROP POLICY IF EXISTS "Users can delete their own records" ON public.identification_records;
DROP POLICY IF EXISTS "Users can insert their own records" ON public.identification_records;
DROP POLICY IF EXISTS "Users can update their own records" ON public.identification_records;
DROP POLICY IF EXISTS "Users can view their own records" ON public.identification_records;

CREATE POLICY "Public read access" ON public.identification_records FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.identification_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.identification_records FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.identification_records FOR DELETE USING (true);

-- quiz_history
DROP POLICY IF EXISTS "Users can delete their own quiz history" ON public.quiz_history;
DROP POLICY IF EXISTS "Users can insert their own quiz history" ON public.quiz_history;
DROP POLICY IF EXISTS "Users can update their own quiz history" ON public.quiz_history;
DROP POLICY IF EXISTS "Users can view their own quiz history" ON public.quiz_history;

CREATE POLICY "Public read access" ON public.quiz_history FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.quiz_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.quiz_history FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete access" ON public.quiz_history FOR DELETE USING (true);

-- flashcard_progress
DROP POLICY IF EXISTS "Users can delete their own flashcard progress" ON public.flashcard_progress;
DROP POLICY IF EXISTS "Users can insert their own flashcard progress" ON public.flashcard_progress;
DROP POLICY IF EXISTS "Users can update their own flashcard progress" ON public.flashcard_progress;
DROP POLICY IF EXISTS "Users can view their own flashcard progress" ON public.flashcard_progress;

CREATE POLICY "Public read access" ON public.flashcard_progress FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.flashcard_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.flashcard_progress FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.flashcard_progress FOR DELETE USING (true);

-- phi_access_logs
DROP POLICY IF EXISTS "System can insert audit logs" ON public.phi_access_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.phi_access_logs;

CREATE POLICY "Public read access" ON public.phi_access_logs FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.phi_access_logs FOR INSERT WITH CHECK (true);

-- profiles
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.profiles FOR DELETE USING (true);
