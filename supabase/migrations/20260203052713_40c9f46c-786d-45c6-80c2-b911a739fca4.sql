-- Remove permissive INSERT policy on notifications
-- Triggers already use SECURITY DEFINER so they can still insert
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;