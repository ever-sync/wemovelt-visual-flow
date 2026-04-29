ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS adult_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS age_gate_blocked_at timestamptz,
  ADD COLUMN IF NOT EXISTS age_gate_block_reason text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_birth_date_reasonable'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_birth_date_reasonable
      CHECK (birth_date IS NULL OR birth_date >= DATE '1900-01-01');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.signup_blocked_email_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (domain)
);

ALTER TABLE public.signup_blocked_email_domains ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_signup_blocked_email_domains_domain
  ON public.signup_blocked_email_domains (lower(domain));

DROP TRIGGER IF EXISTS update_signup_blocked_email_domains_updated_at
  ON public.signup_blocked_email_domains;

CREATE TRIGGER update_signup_blocked_email_domains_updated_at
  BEFORE UPDATE ON public.signup_blocked_email_domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Admins can view blocked signup domains"
  ON public.signup_blocked_email_domains;
CREATE POLICY "Admins can view blocked signup domains"
  ON public.signup_blocked_email_domains
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage blocked signup domains"
  ON public.signup_blocked_email_domains;
CREATE POLICY "Admins can manage blocked signup domains"
  ON public.signup_blocked_email_domains
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.signup_blocked_email_domains (domain, reason)
VALUES
  ('10minutemail.com', 'Disposable email provider'),
  ('guerrillamail.com', 'Disposable email provider'),
  ('mailinator.com', 'Disposable email provider'),
  ('tempmail.com', 'Disposable email provider'),
  ('yopmail.com', 'Disposable email provider')
ON CONFLICT (domain) DO NOTHING;

CREATE OR REPLACE FUNCTION public.try_parse_birth_date(raw_birth_date text)
RETURNS date
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
  parsed_birth_date date;
BEGIN
  IF raw_birth_date IS NULL OR raw_birth_date !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RETURN NULL;
  END IF;

  BEGIN
    parsed_birth_date := raw_birth_date::date;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;

  IF to_char(parsed_birth_date, 'YYYY-MM-DD') <> raw_birth_date THEN
    RETURN NULL;
  END IF;

  RETURN parsed_birth_date;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_age_years(
  p_birth_date date,
  p_reference_date date DEFAULT CURRENT_DATE
)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT GREATEST(0, date_part('year', age(p_reference_date, p_birth_date))::integer)
$$;

CREATE OR REPLACE FUNCTION public.is_birth_date_adult(
  p_birth_date date,
  p_reference_date date DEFAULT CURRENT_DATE
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    p_birth_date IS NOT NULL
    AND p_birth_date >= DATE '1900-01-01'
    AND age(p_reference_date, p_birth_date) >= interval '18 years'
$$;

CREATE OR REPLACE FUNCTION public.is_user_adult_verified(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = p_user_id
      AND p.adult_verified_at IS NOT NULL
      AND p.age_gate_blocked_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.hook_enforce_adult_signup(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  raw_email text;
  email_domain text;
  raw_birth_date text;
  parsed_birth_date date;
  accepted_adult_declaration boolean;
  blocked_domain_reason text;
BEGIN
  raw_email := lower(trim(event->'user'->>'email'));
  email_domain := split_part(raw_email, '@', 2);

  SELECT reason
  INTO blocked_domain_reason
  FROM public.signup_blocked_email_domains
  WHERE lower(domain) = email_domain
  LIMIT 1;

  IF blocked_domain_reason IS NOT NULL THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Este dominio de e-mail nao pode ser usado para cadastro.'
      )
    );
  END IF;

  raw_birth_date := event->'user'->'user_metadata'->>'birth_date';
  parsed_birth_date := public.try_parse_birth_date(raw_birth_date);

  IF parsed_birth_date IS NULL THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Informe uma data de nascimento valida para criar a conta.'
      )
    );
  END IF;

  accepted_adult_declaration := lower(coalesce(event->'user'->'user_metadata'->>'adult_declaration', 'false'))
    IN ('true', 't', '1', 'yes', 'on');

  IF NOT accepted_adult_declaration THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Confirme que voce tem 18 anos ou mais para criar a conta.'
      )
    );
  END IF;

  IF NOT public.is_birth_date_adult(parsed_birth_date) THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'O WEMOVELT e exclusivo para maiores de 18 anos.'
      )
    );
  END IF;

  RETURN '{}'::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  parsed_birth_date date;
  accepted_terms boolean;
  accepted_privacy boolean;
BEGIN
  parsed_birth_date := public.try_parse_birth_date(NEW.raw_user_meta_data->>'birth_date');
  accepted_terms := lower(coalesce(NEW.raw_user_meta_data->>'terms_accepted', 'false')) IN ('true', 't', '1', 'yes', 'on');
  accepted_privacy := lower(coalesce(NEW.raw_user_meta_data->>'privacy_accepted', 'false')) IN ('true', 't', '1', 'yes', 'on');

  INSERT INTO public.profiles (
    id,
    name,
    birth_date,
    age,
    adult_verified_at,
    terms_accepted_at,
    privacy_accepted_at
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''), 'Usuario'),
    parsed_birth_date,
    CASE
      WHEN parsed_birth_date IS NOT NULL THEN public.calculate_age_years(parsed_birth_date)
      ELSE NULL
    END,
    CASE
      WHEN public.is_birth_date_adult(parsed_birth_date) THEN now()
      ELSE NULL
    END,
    CASE WHEN accepted_terms THEN now() ELSE NULL END,
    CASE WHEN accepted_privacy THEN now() ELSE NULL END
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_adult_profile(
  p_birth_date date,
  p_accept_terms boolean DEFAULT false,
  p_accept_privacy boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_user_id uuid;
  normalized_age integer;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'message', 'Sessao expirada. Entre novamente.'
    );
  END IF;

  IF p_birth_date IS NULL OR p_birth_date < DATE '1900-01-01' THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'message', 'Informe uma data de nascimento valida.'
    );
  END IF;

  IF NOT p_accept_terms OR NOT p_accept_privacy THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'message', 'Aceite os termos e a politica de privacidade para continuar.'
    );
  END IF;

  normalized_age := public.calculate_age_years(p_birth_date);
  PERFORM set_config('app.age_gate_rpc', 'on', true);

  IF NOT public.is_birth_date_adult(p_birth_date) THEN
    UPDATE public.profiles
    SET
      birth_date = p_birth_date,
      age = normalized_age,
      adult_verified_at = NULL,
      age_gate_blocked_at = COALESCE(age_gate_blocked_at, now()),
      age_gate_block_reason = 'UNDERAGE_SELF_DECLARED'
    WHERE id = current_user_id;

    RETURN jsonb_build_object(
      'allowed', false,
      'message', 'O WEMOVELT e exclusivo para maiores de 18 anos.'
    );
  END IF;

  UPDATE public.profiles
  SET
    birth_date = p_birth_date,
    age = normalized_age,
    adult_verified_at = COALESCE(adult_verified_at, now()),
    terms_accepted_at = COALESCE(terms_accepted_at, now()),
    privacy_accepted_at = COALESCE(privacy_accepted_at, now()),
    age_gate_blocked_at = NULL,
    age_gate_block_reason = NULL
  WHERE id = current_user_id;

  RETURN jsonb_build_object(
    'allowed', true,
    'message', 'Acesso confirmado.'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_profile_age_gate_tampering()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF current_setting('app.age_gate_rpc', true) = 'on'
    OR current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin', 'service_role')
  THEN
    RETURN NEW;
  END IF;

  IF NEW.birth_date IS DISTINCT FROM OLD.birth_date
    OR NEW.adult_verified_at IS DISTINCT FROM OLD.adult_verified_at
    OR NEW.terms_accepted_at IS DISTINCT FROM OLD.terms_accepted_at
    OR NEW.privacy_accepted_at IS DISTINCT FROM OLD.privacy_accepted_at
    OR NEW.age_gate_blocked_at IS DISTINCT FROM OLD.age_gate_blocked_at
    OR NEW.age_gate_block_reason IS DISTINCT FROM OLD.age_gate_block_reason
  THEN
    RAISE EXCEPTION 'AGE_GATE_FIELDS_READ_ONLY';
  END IF;

  RETURN NEW;
END;
$$;

UPDATE public.profiles
SET
  age_gate_blocked_at = COALESCE(age_gate_blocked_at, now()),
  age_gate_block_reason = COALESCE(age_gate_block_reason, 'UNDERAGE_EXISTING_PROFILE')
WHERE age IS NOT NULL
  AND age < 18
  AND adult_verified_at IS NULL
  AND age_gate_blocked_at IS NULL;

DROP TRIGGER IF EXISTS prevent_profile_age_gate_tampering
  ON public.profiles;

CREATE TRIGGER prevent_profile_age_gate_tampering
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_age_gate_tampering();

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.signup_blocked_email_domains TO supabase_auth_admin;

GRANT EXECUTE ON FUNCTION public.hook_enforce_adult_signup(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.verify_adult_profile(date, boolean, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_adult_verified(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.hook_enforce_adult_signup(jsonb) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.verify_adult_profile(date, boolean, boolean) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_user_adult_verified(uuid) FROM anon, public;
