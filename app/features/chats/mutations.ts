import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "react-router";
import type { Database } from "~/supa-client";
import { getProductById } from "../products/queries";

export const createChatRoom = async (
  client: SupabaseClient<Database>,
  { productId, userId }: { productId: string; userId: string }
) => {
  const { data, error } = await client
    .from("chats_view")
    .select("*")
    .eq("profile_id", userId)
    .eq("product_id", Number(productId));

  if (error) throw error;
  if (data.length > 0) {
    const [chatRoom] = data;
    if (chatRoom.is_out) {
      // 방에서 나갔음으로 update 후 방으로 이동
      await client
        .from("chat_room_members")
        .update({ is_out: false })
        .eq("profile_id", userId)
        .eq("chat_room_id", chatRoom.chat_room_id);
    }

    return redirect(`/chats/${chatRoom.chat_room_id}`);
  } else {
    const product = await getProductById(client, {
      product_id: Number(productId),
    });

    const { data, error } = await client
      .from("chat_rooms")
      .insert({ product_id: Number(productId) })
      .select()
      .single();

    if (error) throw error;
    if (data) {
      const rows = [
        { chat_room_id: data.chat_room_id, profile_id: userId },
        {
          chat_room_id: data.chat_room_id,
          profile_id: product.profile_id,
        },
      ];
      await client.from("chat_room_members").insert(rows);
      return redirect(`/chats/${data.chat_room_id}`);
    }
  }
};

export const sendMessage = async (
  client: SupabaseClient<Database>,
  {
    chatRoomId,
    message,
    userId,
  }: { chatRoomId: string; message: string; userId: string }
) => {
  const { error } = await client.from("messages").insert({
    chat_room_id: Number(chatRoomId),
    sender_id: userId,
    content: message,
    seen: false,
  });

  if (error) throw error;
};
