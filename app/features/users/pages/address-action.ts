import { makeSSRClient } from "~/supa-client";
import { addUserAddress, updateUserAddress, deleteUserAddress } from "~/features/users/mutations";
import { getUserAddresses } from "~/features/users/queries";
import { parseAddAddressForm } from "~/features/users/schema.validation";
import type { Route } from "./+types/address-action";

/**
 * GET: 주소 목록 조회 (useFetcher.load()용)
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { addresses: [] };
  }

  const addresses = await getUserAddresses(client, user.id);
  return { addresses };
};

/**
 * POST: 주소 추가/수정
 */
export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const intent = formData.get("intent") as string;
  const addressId = formData.get("addressId") as string | null;
  const isDefault = formData.get("isDefault") === "true";

  // 삭제 처리 (별도 validation 없음)
  if (intent === "delete" && addressId) {
    try {
      await deleteUserAddress(client, { addressId, userId: user.id });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete address:", error);
      return { success: false, error: "주소 삭제에 실패했습니다." };
    }
  }

  // zod validation (추가/수정용)
  const result = parseAddAddressForm(formData);

  if (!result.success) {
    const firstError = result.error.errors[0]?.message ?? "입력값을 확인해주세요.";
    return { success: false, error: firstError };
  }

  const { label, recipientName, recipientPhone, zoneCode, address, addressDetail } = result.data;

  try {
    if (intent === "update" && addressId) {
      // 수정
      await updateUserAddress(client, {
        addressId,
        userId: user.id,
        label,
        recipientName,
        recipientPhone,
        zoneCode,
        address,
        addressDetail,
        isDefault,
      });
    } else {
      // 추가
      await addUserAddress(client, {
        userId: user.id,
        label,
        recipientName,
        recipientPhone,
        zoneCode,
        address,
        addressDetail,
        isDefault,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to save address:", error);
    return { success: false, error: "주소 저장에 실패했습니다." };
  }
};
