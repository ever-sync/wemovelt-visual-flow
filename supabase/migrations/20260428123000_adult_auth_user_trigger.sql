CREATE OR REPLACE FUNCTION public.enforce_adult_auth_user_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  raw_email text;
  email_domain text;
  raw_birth_date text;
  parsed_birth_date date;
  accepted_adult_declaration boolean;
  blocked_domain_reason text;
BEGIN
  raw_email := lower(trim(NEW.email));
  email_domain := split_part(raw_email, '@', 2);

  SELECT reason
  INTO blocked_domain_reason
  FROM public.signup_blocked_email_domains
  WHERE lower(domain) = email_domain
  LIMIT 1;

  IF blocked_domain_reason IS NOT NULL THEN
    RAISE EXCEPTION 'Este dominio de e-mail nao pode ser usado para cadastro.'
      USING ERRCODE = 'check_violation';
  END IF;

  raw_birth_date := NEW.raw_user_meta_data->>'birth_date';
  parsed_birth_date := public.try_parse_birth_date(raw_birth_date);

  IF parsed_birth_date IS NULL THEN
    RAISE EXCEPTION 'Informe uma data de nascimento valida para criar a conta.'
      USING ERRCODE = 'check_violation';
  END IF;

  accepted_adult_declaration := lower(coalesce(NEW.raw_user_meta_data->>'adult_declaration', 'false'))
    IN ('true', 't', '1', 'yes', 'on');

  IF NOT accepted_adult_declaration THEN
    RAISE EXCEPTION 'Confirme que voce tem 18 anos ou mais para criar a conta.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NOT public.is_birth_date_adult(parsed_birth_date) THEN
    RAISE EXCEPTION 'O WEMOVELT e exclusivo para maiores de 18 anos.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_adult_auth_user_insert
  ON auth.users;

CREATE TRIGGER enforce_adult_auth_user_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_adult_auth_user_insert();
