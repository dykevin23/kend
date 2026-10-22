import { useCallback, useState } from "react";

/**
 * 이미지 로드 실패 여부 — SSR된 <img>는 hydration 전에 이미 실패할 수 있어
 * onError만으로는 놓친다. ref 콜백에서 마운트 시점의 실패 상태도 확인한다.
 */
export function useImageError() {
  const [imageError, setImageError] = useState(false);

  const imageRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0) setImageError(true);
  }, []);

  const onError = useCallback(() => setImageError(true), []);

  return { imageError, imageRef, onError };
}
