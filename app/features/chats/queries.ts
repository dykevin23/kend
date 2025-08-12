import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";
import type { MessageProps } from "./components/chatRoom";

export const getChatRooms = async (
  client: SupabaseClient<Database>,
  { userId }: { userId: string }
) => {
  const { data, error } = await client
    .from("chats_view")
    .select("*")
    .eq("profile_id", userId)
    .not("last_message", "is", null)
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

export const getMessages = async (
  client: SupabaseClient<Database>,
  { chatRoomId }: { chatRoomId: string }
) => {
  const { data, error } = await client
    .from("messages_view")
    .select("*")
    .eq("chat_room_id", Number(chatRoomId))
    .order("message_id", { ascending: true });

  if (error) throw error;
  return data;
};
