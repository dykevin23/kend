-- ============================================================
-- reviews 스토리지 버킷 + RLS 정책 (리뷰 첨부 이미지)
-- 경로 규칙: {userId}/{deliveryItemId}/{randomId}.{ext}
-- profiles 버킷의 "폴더 첫 세그먼트 = auth.uid()" 소유권 검증 패턴과 동일
-- Supabase SQL Editor에서 실행
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reviews', 'reviews', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read review images"
ON storage.objects FOR SELECT
USING (bucket_id = 'reviews');

CREATE POLICY "Users can upload own review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reviews'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can delete own review images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reviews'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
