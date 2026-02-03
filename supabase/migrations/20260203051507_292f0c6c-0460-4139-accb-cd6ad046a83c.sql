-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications (for triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Function to create notification on post like
CREATE OR REPLACE FUNCTION public.notify_on_post_like()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  liker_name TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user likes their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker name
  SELECT name INTO liker_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    post_owner_id,
    'like',
    'Nova curtida',
    COALESCE(liker_name, 'Alguém') || ' curtiu sua publicação ❤️',
    jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for likes
CREATE TRIGGER on_post_like_notify
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_on_post_like();

-- Function to create notification on comment
CREATE OR REPLACE FUNCTION public.notify_on_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  commenter_name TEXT;
  comment_preview TEXT;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user comments on their own post
  IF post_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter name
  SELECT name INTO commenter_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Get comment preview (first 50 chars)
  comment_preview := LEFT(NEW.content, 50);
  IF LENGTH(NEW.content) > 50 THEN
    comment_preview := comment_preview || '...';
  END IF;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    post_owner_id,
    'comment',
    'Novo comentário',
    COALESCE(commenter_name, 'Alguém') || ' comentou: "' || comment_preview || '"',
    jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id, 'commenter_id', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for comments
CREATE TRIGGER on_post_comment_notify
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_post_comment();