/**
 * 프로필 이미지 URL 생성 (서버 전용)
 * - userId만 있으면 Storage에서 이미지 URL 생성
 */
export function getProfileImageUrl(userId: string): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/profiles/${userId}`;
}
