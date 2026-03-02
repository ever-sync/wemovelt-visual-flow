-- Revoke anonymous access to profiles_public view
-- Only authenticated users should see profile data
REVOKE SELECT ON public.profiles_public FROM anon;