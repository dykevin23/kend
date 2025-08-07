import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const getChatRooms = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  const { data, error } = await client
    .from("chats_view")
    .select("*")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getChatRoomById = async (
  client: SupabaseClient<Database>,
  { chatRoomId, userId }: { chatRoomId: string; userId: string }
) => {
  const { data, error } = await client
    .from("chats_view")
    .select("*")
    .eq("profile_id", userId)
    .eq("chat_room_id", Number(chatRoomId))
    .single();

  if (error) throw error;
  return data;
};
