
-- 1. Add DELETE policies for all three tables
CREATE POLICY "Users can delete their own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz history"
  ON public.quiz_history
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard progress"
  ON public.flashcard_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Harden handle_new_user with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  display_name_value TEXT;
BEGIN
  display_name_value := COALESCE(
    NULLIF(TRIM(SUBSTRING(NEW.raw_user_meta_data->>'display_name', 1, 100)), ''),
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, display_name_value);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
