import { useEffect, useState } from "react";
import Header from "~/common/components/header";
import Filter from "../components/Filter";
import ChatCard from "../components/chat-card";
import type { Route } from "./+types/chats-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getChatRooms } from "../queries";
import type { ChatFilterType } from "../constrants";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const chats = await getChatRooms(client, { userId });
  return { chats, userId };
};

export default function ChatsPage({ loaderData }: Route.ComponentProps) {
  const [filter, setFilter] = useState<ChatFilterType>("");
  const [chats, setChats] = useState(loaderData.chats);

  useEffect(() => {
    if (filter === "") {
      setChats(loaderData.chats);
    } else if (filter === "purchase") {
      setChats(
        loaderData.chats.filter(
          (chat) =>
            chat.product_status === "sales" &&
            chat.owner_profile_id !== loaderData.userId
        )
      );
    } else if (filter === "sale") {
      setChats(
        loaderData.chats.filter(
          (chat) =>
            chat.product_status === "sales" &&
            chat.owner_profile_id === loaderData.userId
        )
      );
    } else if (filter === "done") {
      setChats(
        loaderData.chats.filter((chat) => chat.product_status === "done")
      );
    }
  }, [filter, loaderData.chats]);

  return (
    <div>
      <Header title="메세지" />
      <Filter filter={filter} onChange={setFilter} />

      <div className="flex w-full flex-col items-start">
        {chats.map((chat) => (
          <ChatCard
            key={chat.chat_room_id}
            id={chat.chat_room_id}
            title={chat.product_name}
            location="2.1km 이내"
            postedAt={chat.created_at}
            avatarUrl={chat.avatar}
            username={chat.nickname}
            productImage={chat.product_image}
            status={chat.product_status}
          />
        ))}
      </div>
    </div>
  );
}
