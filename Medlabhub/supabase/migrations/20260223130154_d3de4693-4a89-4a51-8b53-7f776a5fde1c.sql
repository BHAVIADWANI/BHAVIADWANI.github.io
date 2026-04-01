
-- Records table with patient info, sample data, identification results, and AST results
CREATE TABLE public.identification_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Sample Info
  sample_id text NOT NULL,
  sample_type text NOT NULL DEFAULT 'Other',
  sample_source text,
  
  -- Patient Info
  patient_name text,
  patient_age integer,
  patient_gender text,
  patient_contact text,
  patient_address text,
  medical_history text,
  referring_physician text,
  
  -- Identification Results
  organism text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0,
  gram_stain text,
  morphology text,
  arrangement text,
  oxygen_requirement text,
  tests jsonb DEFAULT '[]'::jsonb,
  notes text,
  lab_id text,
  clinical_significance text,
  associated_diseases jsonb DEFAULT '[]'::jsonb,
  recommended_treatment jsonb DEFAULT '[]'::jsonb,
  resistance_profile jsonb DEFAULT '[]'::jsonb,
  
  -- AST Results (linked)
  ast_results jsonb DEFAULT '[]'::jsonb,
  ast_organism text
);

ALTER TABLE public.identification_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own records"
  ON public.identification_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records"
  ON public.identification_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
  ON public.identification_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
  ON public.identification_records FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_records_updated_at
  BEFORE UPDATE ON public.identification_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
