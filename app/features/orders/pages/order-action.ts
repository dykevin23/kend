import { makeSSRClient } from "~/supa-client";
import { createOrder, confirmPurchase, requestReturn } from "~/features/orders/mutations";
import type { ReturnReasonType } from "~/features/orders/types";
import { cancelOrderGroup } from "~/features/orders/mutations.server";
import { actionErrorResponse } from "~/lib/error-handler";
import type { Route } from "./+types/order-action";
import type { OrderItem, SellerOrderGroup } from "~/features/orders/types";
import type { UserAddress } from "~/features/users/queries";

/**
 * POST: 주문 생성
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

  if (intent === "create") {
    try {
      const addressJson = formData.get("address") as string;
      const sellerGroupsJson = formData.get("sellerGroups") as string;
      const itemsJson = formData.get("items") as string;
      const deliveryMessage = (formData.get("deliveryMessage") as string) || null;

      const address: UserAddress = JSON.parse(addressJson);
      const sellerGroups: SellerOrderGroup[] = JSON.parse(sellerGroupsJson);
      const items: OrderItem[] = JSON.parse(itemsJson);

      const result = await createOrder(client, {
        userId: user.id,
        address,
        sellerGroups,
        items,
        deliveryMessage,
      });

      return {
        success: true,
        orderGroupId: result.orderGroupId,
        orderNumber: result.orderNumber,
      };
    } catch (error) {
      return actionErrorResponse(error);
    }
  }

  if (intent === "cancel") {
    try {
      const orderGroupId = formData.get("orderGroupId") as string;
      const cancelReason =
        (formData.get("cancelReason") as string) || "구매자 주문 취소";

      if (!orderGroupId) {
        return { success: false, error: "주문 정보가 없습니다." };
      }

      const result = await cancelOrderGroup(client, {
        userId: user.id,
        orderGroupId,
        cancelReason,
      });

      return {
        success: true,
        orderGroupId: result.orderGroupId,
        orderNumber: result.orderNumber,
      };
    } catch (error) {
      return actionErrorResponse(error);
    }
  }

  if (intent === "confirmPurchase") {
    try {
      const orderId = formData.get("orderId") as string;

      if (!orderId) {
        return { success: false, error: "주문 정보가 없습니다." };
      }

      const result = await confirmPurchase(client, { userId: user.id, orderId });

      return { success: true, orderId: result.orderId };
    } catch (error) {
      return actionErrorResponse(error);
    }
  }

  if (intent === "requestReturn") {
    try {
      const deliveryItemId = formData.get("deliveryItemId") as string;
      const reason = formData.get("reason") as ReturnReasonType;

      if (!deliveryItemId || !reason) {
        return { success: false, error: "반품 신청 정보가 부족합니다." };
      }

      const result = await requestReturn(client, {
        userId: user.id,
        deliveryItemId,
        reason,
      });

      return { success: true, deliveryItemId: result.deliveryItemId };
    } catch (error) {
      return actionErrorResponse(error);
    }
  }

  return { success: false, error: "잘못된 요청입니다." };
};
