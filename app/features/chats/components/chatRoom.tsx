import Chat from "./chat";

export interface MessageProps {
  messageId: string;
  message: string;
  reverse: boolean;
  username: string;
  avatar: string;
  postedAt: string;
  isFirst: boolean;
  seen: boolean;
}

export interface MessagesType {
  [key: string]: MessageProps[];
}

export default function ChatRoom({ messages }: { messages: MessagesType }) {
  // console.log("### messages => ", messages);
  return Object.keys(messages).map((date) => (
    <>
      <span className="text-xs leading-3 text-primary">
        2025년 2월 11일 목요일
      </span>
      <div className="flex flex-col items-start gap-2 self-stretch">
        {messages[date].map((message) => (
          <Chat key={message.messageId} {...message} />
        ))}
      </div>
    </>
  ));
}
