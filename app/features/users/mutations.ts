import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const followUser = async (
  client: SupabaseClient<Database>,
  {
    followerId,
    followingId,
  }: {
    followerId: string;
    followingId: string;
  }
) => {
  const { count, error } = await client
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) throw error;
  if (count === 0) {
    await client.from("follows").insert({
      follower_id: followerId,
      following_id: followingId,
    });
  } else {
    await client
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
  }
};
