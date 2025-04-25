import { useState } from "react";
import Header from "~/common/components/header";
import Filter from "../components/Filter";
import ChatCard from "../components/chat-card";

export default function ChatsPage() {
  const [filter, setFilter] = useState<string>("");
  return (
    <div>
      <Header title="메세지" />
      <Filter filter={filter} onChange={setFilter} />

      <div className="flex w-full flex-col items-start">
        {Array.from({ length: 20 }).map((_, index) => (
          <ChatCard
            key={`chatId-${index}`}
            id={`chatId-${index}`}
            title="몽클레어 키즈 현대백화점 영수증"
            location="2.1km 이내"
            postedAt="1분 전"
            status="판매중"
            avatarUrl="https://github.com/brunomars.png"
            username="강남아메리카노"
          />
        ))}
      </div>
    </div>
  );
}
