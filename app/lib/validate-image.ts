const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * 이미지 파일의 크기와 형식을 검증한다.
 * @returns 에러 메시지 (유효하면 null)
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "JPG, PNG, WebP 형식만 업로드할 수 있어요.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "파일 크기는 5MB 이하여야 해요.";
  }
  return null;
}
