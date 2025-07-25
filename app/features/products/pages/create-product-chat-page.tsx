import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/create-product-chat-page";
import { getLoggedInUserId } from "~/features/users/queries";
import { redirect } from "react-router";
import { createChatRoom } from "~/features/chats/mutations";

export const action = async ({ request, params }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const chatRoomId = await createChatRoom(client, {
    productId: params.productId,
    userId,
  });

  return redirect(`/chats/${chatRoomId}`);
};
