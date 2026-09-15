import { makeSSRClient } from "~/supa-client";
import { reverseGeocodeCoordinates } from "~/features/users/geocoding.server";
import type { Route } from "./+types/reverse-geocode-action";

/**
 * GET: 좌표(위경도) -> 주소 변환 ("현재 위치로 주소 찾기")
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { success: false, error: "INVALID_COORDS" };
  }

  return reverseGeocodeCoordinates(lat, lng);
};
