/**
 * Kakao Local API 역지오코딩 유틸리티
 * .server.ts 접미사로 서버 번들에만 포함 (KAKAO_REST_API_KEY 보호)
 */

interface ReverseGeocodeResult {
  success: boolean;
  error?: string;
  zoneCode?: string;
  address?: string;
}

/**
 * 좌표(위경도) -> 주소 변환
 * https://developers.kakao.com/docs/latest/ko/local/dev-guide#coord-to-address
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  const restApiKey = process.env.KAKAO_REST_API_KEY;

  if (!restApiKey) {
    console.error("KAKAO_REST_API_KEY is not configured");
    return { success: false, error: "GEOCODE_FAILED" };
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      { headers: { Authorization: `KakaoAK ${restApiKey}` } }
    );

    if (!response.ok) {
      console.error("Kakao coord2address failed", response.status);
      return { success: false, error: "GEOCODE_FAILED" };
    }

    const data = await response.json();
    const doc = data.documents?.[0];

    if (!doc) {
      return { success: false, error: "NO_RESULT" };
    }

    return {
      success: true,
      zoneCode: doc.road_address?.zone_no ?? "",
      address: doc.road_address?.address_name ?? doc.address?.address_name ?? "",
    };
  } catch (error) {
    console.error("Kakao coord2address error", error);
    return { success: false, error: "GEOCODE_FAILED" };
  }
}
