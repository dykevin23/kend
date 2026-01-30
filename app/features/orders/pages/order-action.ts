import { makeSSRClient } from "~/supa-client";
import { createOrder } from "~/features/orders/mutations";
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
      const paymentMethod = formData.get("paymentMethod") as string;

      const address: UserAddress = JSON.parse(addressJson);
      const sellerGroups: SellerOrderGroup[] = JSON.parse(sellerGroupsJson);
      const items: OrderItem[] = JSON.parse(itemsJson);

      const result = await createOrder(client, {
        userId: user.id,
        address,
        sellerGroups,
        items,
        paymentMethod,
      });

      return {
        success: true,
        orderGroupId: result.orderGroupId,
        orderNumber: result.orderNumber,
      };
    } catch (error) {
      console.error("Failed to create order:", error);
      return { success: false, error: "주문 생성에 실패했습니다." };
    }
  }

  return { success: false, error: "잘못된 요청입니다." };
};
