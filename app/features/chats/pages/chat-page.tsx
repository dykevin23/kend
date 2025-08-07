import SubHeader from "~/common/components/sub-header";
import Chat from "../components/chat";
import { Plus, Send } from "lucide-react";
import { Input } from "~/common/components/ui/input";
import type { Route } from "./+types/chat-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getChatRoomById } from "../queries";
import UserAvatar from "~/common/components/user-avatar";
import { formatCurrency } from "~/lib/utils";
import { Link } from "react-router";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const chatRoom = await getChatRoomById(client, {
    chatRoomId: params.chatId,
    userId,
  });
  return { chatRoom };
};

export default function ChatPage({ loaderData }: Route.ComponentProps) {
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
      <div className="flex w-full py-6 px-4 flex-col items-center gap-6">
        <span className="text-xs leading-3 text-primary">
          2025년 2월 11일 목요일
        </span>

        <Chat message="안녕하세요" postedAt="오후 3:40" />
        <Chat
          message="안녕하세요"
          postedAt="오후 3:42"
          reverse
          avatarUrl="https://github.com/facebook.png"
        />
        <Chat
          message="제품 구매희망 합니다. 위치가 어디쯤 되시나요 제가 찾아가겠습니다."
          postedAt="오후 3:53"
        />
        <Chat
          message="강남구 압구정동 현대아파트 109동 903호  입니다. 차량번호 말씀해주세요"
          postedAt="오후 3:54"
          reverse
          avatarUrl="https://github.com/facebook.png"
        />

        <div className="flex p-3 justify-center items-center gap-2.5 self-stretch rounded-full bg-secondary">
          <div className="grow shrink-0 basis-0">
            <span className="text-xs leading-4.75">
              주소, 전화번호, 계좌 등 민감한 개인정보가 공유되었어요. 개인 정보
              유출 피해 방지를 위해 택배 보다 대면으로 거래하세요.
            </span>
          </div>
        </div>

        <Chat
          message="341나 9680입니다 내일 모레 오후 7시 쯤 시간 되시나요? 아마도 그전에 도착하긴 할것 같은데 혹시 몰라서요."
          postedAt="오후 3:59"
        />

        <Chat
          message="네, 차량등록은 해두었고, 내일 오시면 될듯합니다 내일은 계속 집에 있을 예정이니 7시 이후 아무때나 오셔도 됩니다 감사합니다"
          postedAt="오후 4:04"
          reverse
          avatarUrl="https://github.com/facebook.png"
        />

        <div className="flex flex-col w-full items-start fixed bottom-0 bg-white">
          <div className="flex h-18 py-2 px-4 justify-center items-center gap-4 self-stretch border-t-1 border-t-muted-foreground/30">
            <Plus className="size-10 bg-muted-foreground/50 rounded-full shrink-0" />
            <div className="flex h-12 p-4 items-center gap-2.5 grow shrink-0 basis-0">
              <Input className="rounded-[200px]" />
            </div>
            <Send className="size-7 aspect-square" />
          </div>
        </div>
      </div>
      {/* 채팅입력영역 */}
    </div>
  );
}
