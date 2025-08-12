import SubHeader from "~/common/components/sub-header";
import { Plus, Send } from "lucide-react";
import { Input } from "~/common/components/ui/input";
import type { Route } from "./+types/chat-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getChatRoomById, getMessages } from "../queries";
import UserAvatar from "~/common/components/user-avatar";
import { formatCurrency } from "~/lib/utils";
import { Form, Link } from "react-router";
import ChatRoom from "../components/chatRoom";
import type { MessagesType } from "../components/chatRoom";
import { useEffect, useState } from "react";
import { Button } from "~/common/components/ui/button";
import { sendMessage } from "../mutations";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const chatRoom = await getChatRoomById(client, {
    chatRoomId: params.chatId,
    userId,
  });
  const messages = await getMessages(client, { chatRoomId: params.chatId });
  return { chatRoom, messages, userId };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();
  const message = formData.get("message");

  if (message) {
    await sendMessage(client, {
      chatRoomId: params.chatId,
      message: message as string,
      userId,
    });
  }
};

export default function ChatPage({ loaderData }: Route.ComponentProps) {
  const [messages, setMessages] = useState<MessagesType | null>(null);

  useEffect(() => {
    const messageDates = [
      ...new Set(loaderData.messages.map((message) => message.created_date)),
    ];

    let object: MessagesType = {};
    messageDates.forEach((item) => {
      const filter = loaderData.messages.filter(
        (message) => message.created_date === item
      );
      Object.assign(object, {
        [item]:
          filter.length > 1
            ? filter.map((message, index) => {
                const convertObject = {
                  messageId: message.message_id,
                  message: message.content,
                  reverse: message.reverse,
                  username: message.nickname,
                  avatar: message.avatar,
                };

                if (index === 0) {
                  const nextMessage = filter[index + 1];
                  const skipShowTime =
                    nextMessage.sender_id === message.sender_id &&
                    nextMessage.created_time === message.created_time;
                  return Object.assign({}, convertObject, {
                    postedAt: skipShowTime ? "" : message.created_time,
                    isFirst: true,
                  });
                } else if (index === filter.length - 1) {
                  return Object.assign({}, convertObject, {
                    postedAt: message.created_time,
                    isFirst: filter[index - 1].sender_id !== message.sender_id,
                  });
                } else {
                  const nextMessage = filter[index + 1];
                  const prevMessage = filter[index - 1];
                  const skipShowTime =
                    nextMessage.sender_id === message.sender_id &&
                    nextMessage.created_time === message.created_time;
                  return Object.assign({}, convertObject, {
                    postedAt: skipShowTime ? "" : message.created_time,
                    isFirst: prevMessage.sender_id !== message.sender_id,
                  });
                }
              })
            : filter.map((message) => ({
                messageId: message.message_id,
                message: message.content,
                reverse: message.reverse,
                username: message.nickname,
                avatar: message.avatar,
                postedAt: message.created_time,
                isFirst: true,
              })),
      });

      setMessages(object);
    });
  }, [loaderData.messages]);

  return (
    <div>
      <SubHeader title="강남아메리카노" />
      {/* 판매정보 */}
      <div className="flex py-2 px-4 items-center gap-4 self-stretch border-b-1 border-b-muted">
        <div className="flex items-center gap-3 grow shrink-0 basis-0">
          <Link
            to={`/products/${loaderData.chatRoom.product_id}`}
            className="flex items-start gap-3 grow shrink-0 basis-0"
          >
            {/* 상품이미지 영역 */}
            <div className="flex size-12 justify-center items-center aspect-square rounded-xl">
              <img src={loaderData.chatRoom.product_image} />
            </div>

            <div className="flex flex-col justify-center items-start gap-2 grow shrink-0 basis-0">
              <div className="flex flex-col justify-center items-start gap-1 self-stretch">
                <div className="flex flex-col items-start gap-1 self-stretch">
                  <span className="font-pretendard text-[15px] not-italic font-normal leading-5.25 overflow-ellipsis overflow-hidden">
                    {loaderData.chatRoom.product_name}
                  </span>
                </div>

                <span className="font-pretendard text-base not-italic font-medium leading-4 tracking-[-0.4px]">
                  {`${formatCurrency(loaderData.chatRoom.price)}원`}
                </span>
              </div>
            </div>
          </Link>
          <Link to={`/users/${loaderData.chatRoom.other_profile_id}`}>
            <UserAvatar
              name={loaderData.chatRoom.nickname}
              avatar={loaderData.chatRoom.avatar}
              mode="view"
              className="size-10 aspect-square"
            />
          </Link>
        </div>
      </div>

      {/* 채팅창 */}
      <div className="flex w-full pt-6 pb-20 px-4 flex-col items-center gap-6">
        {messages ? <ChatRoom messages={messages} /> : null}

        <div className="flex flex-col w-full items-start fixed bottom-0 bg-white">
          <div className="flex h-18 py-2 px-4 justify-center items-center gap-4 self-stretch border-t-1 border-t-muted-foreground/30">
            <Plus className="size-10 bg-muted-foreground/50 rounded-full shrink-0" />
            <Form method="post" className="flex items-center">
              <div className="flex h-12 p-4 items-center gap-2.5 grow shrink-0 basis-0">
                <Input
                  id="message"
                  name="message"
                  className="rounded-[200px]"
                />
              </div>
              <Button type="submit">
                <Send className="size-7 aspect-square" />
              </Button>
            </Form>
          </div>
        </div>
      </div>
      {/* 채팅입력영역 */}
    </div>
  );
}
