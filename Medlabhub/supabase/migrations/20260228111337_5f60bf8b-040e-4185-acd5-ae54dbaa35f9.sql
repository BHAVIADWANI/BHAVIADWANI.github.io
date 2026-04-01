
-- Server-side validation trigger for identification_records
CREATE OR REPLACE FUNCTION public.validate_identification_record()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate and sanitize sample_id (required, max 100 chars)
  IF NEW.sample_id IS NULL OR TRIM(NEW.sample_id) = '' THEN
    RAISE EXCEPTION 'sample_id is required';
  END IF;
  NEW.sample_id := TRIM(SUBSTRING(NEW.sample_id, 1, 100));

  -- Validate and sanitize organism (required, max 200 chars)
  IF NEW.organism IS NULL OR TRIM(NEW.organism) = '' THEN
    RAISE EXCEPTION 'organism is required';
  END IF;
  NEW.organism := TRIM(SUBSTRING(NEW.organism, 1, 200));

  -- Validate patient_age (0-150 if provided)
  IF NEW.patient_age IS NOT NULL AND (NEW.patient_age < 0 OR NEW.patient_age > 150) THEN
    RAISE EXCEPTION 'patient_age must be between 0 and 150';
  END IF;

  -- Validate confidence (0-100)
  IF NEW.confidence < 0 OR NEW.confidence > 100 THEN
    NEW.confidence := GREATEST(0, LEAST(100, NEW.confidence));
  END IF;

  -- Sanitize text fields: trim and enforce max lengths
  NEW.patient_name := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.patient_name, ''), 1, 100)), '');
  NEW.patient_contact := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.patient_contact, ''), 1, 200)), '');
  NEW.patient_address := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.patient_address, ''), 1, 500)), '');
  NEW.medical_history := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.medical_history, ''), 1, 2000)), '');
  NEW.referring_physician := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.referring_physician, ''), 1, 100)), '');
  NEW.sample_source := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.sample_source, ''), 1, 200)), '');
  NEW.notes := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.notes, ''), 1, 2000)), '');
  NEW.lab_id := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.lab_id, ''), 1, 50)), '');
  NEW.clinical_significance := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.clinical_significance, ''), 1, 2000)), '');
  NEW.ast_organism := NULLIF(TRIM(SUBSTRING(COALESCE(NEW.ast_organism, ''), 1, 200)), '');

  -- Validate patient_gender against allowed values
  IF NEW.patient_gender IS NOT NULL AND NEW.patient_gender NOT IN ('Male', 'Female', 'Other', '') THEN
    NEW.patient_gender := NULL;
  END IF;
  NEW.patient_gender := NULLIF(NEW.patient_gender, '');

  RETURN NEW;
END;
$$;

-- Attach validation trigger (runs BEFORE insert/update)
CREATE TRIGGER validate_identification_record_trigger
  BEFORE INSERT OR UPDATE ON public.identification_records
  FOR EACH ROW EXECUTE FUNCTION public.validate_identification_record();
