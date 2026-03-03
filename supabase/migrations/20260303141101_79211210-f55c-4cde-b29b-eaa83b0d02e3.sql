INSERT INTO storage.buckets (id, name, public) VALUES ('equipment-images', 'equipment-images', true);

CREATE POLICY "Anyone can view equipment images"
ON storage.objects FOR SELECT USING (bucket_id = 'equipment-images');

CREATE POLICY "Admins can upload equipment images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'equipment-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete equipment images"
ON storage.objects FOR DELETE
USING (bucket_id = 'equipment-images' AND public.has_role(auth.uid(), 'admin'));