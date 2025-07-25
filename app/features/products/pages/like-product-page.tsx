import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/like-product-page";
import { getLoggedInUserId } from "~/features/users/queries";
import { likeProduct } from "../mutations";

export const action = async ({ request, params }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { productId } = params;
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  await likeProduct(client, { userId, productId });
  return { ok: true };
};
