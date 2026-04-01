CREATE POLICY "Users can update their own quiz history"
  ON public.quiz_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);