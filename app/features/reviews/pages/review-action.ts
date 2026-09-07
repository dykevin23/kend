import { makeSSRClient } from "~/supa-client";
import { createReview } from "~/features/reviews/mutations";
import { actionErrorResponse } from "~/lib/error-handler";
import type { Route } from "./+types/review-action";

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "create") {
    try {
      const productId = formData.get("productId") as string;
      const deliveryItemId = formData.get("deliveryItemId") as string;
      const rating = Number(formData.get("rating"));
      const content = (formData.get("content") as string)?.trim();
      const imageUrls = formData.getAll("imageUrls") as string[];

      if (!rating || !content) {
        return { success: false, error: "별점과 리뷰 내용을 모두 입력해 주세요." };
      }

      const review = await createReview(client, {
        userId: user.id,
        productId,
        deliveryItemId,
        rating,
        content,
        imageUrls,
      });

      return { success: true, reviewId: review.id };
    } catch (error) {
      return actionErrorResponse(error);
    }
  }

  return { success: false, error: "잘못된 요청입니다." };
};
