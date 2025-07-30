import { makeSSRClient } from "~/supa-client";
import type { Route } from "./+types/user-follow-page";
import { getLoggedInUserId } from "../queries";
import { followUser } from "../mutations";

export const action = async ({ request, params }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  await followUser(client, { followerId: userId, followingId: params.userId });
};
