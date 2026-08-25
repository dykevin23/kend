import { Link, redirect, useLoaderData } from "react-router";
import { DateTime } from "luxon";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { makeSSRClient } from "~/supa-client";
import { getInquiryDetail } from "../queries";
import { INQUIRY_CATEGORY_LABELS, getInquiryStatusLabel } from "../utils";
import type { Route } from "./+types/inquiry-detail-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw redirect("/auth/login");
  }

  const inquiry = await getInquiryDetail(client, params.inquiryId, user.id);

  return { inquiry };
};

const formatDate = (value: string | null) =>
  value ? DateTime.fromISO(value).toFormat("yyyy.M.d HH:mm") : null;

export default function InquiryDetailPage() {
  const { inquiry } = useLoaderData<typeof loader>();
  const status = getInquiryStatusLabel(inquiry.status);

  return (
    <Content
      headerPorps={{ title: "문의 상세", useRight: false }}
      footer={
        <Button className="w-full" asChild>
          <Link to="/myPage/inquiries">목록으로</Link>
        </Button>
      }
    >
      <div className="flex flex-col w-full bg-gray-50 min-h-full">
        <div className="flex flex-col gap-2 px-4 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {INQUIRY_CATEGORY_LABELS[inquiry.category]}
            </span>
            <span className={`text-xs font-bold ${status.color}`}>{status.label}</span>
          </div>
          <span className="text-base font-bold text-gray-900">{inquiry.title}</span>
          <span className="text-xs text-gray-400">{formatDate(inquiry.createdAt)}</span>

          {inquiry.order && (
            <Link
              to={`/orders/${inquiry.order.orderGroupId}`}
              className="flex items-stretch gap-3 mt-1 p-3 rounded-lg border border-gray-100 bg-gray-50"
            >
              {/* 주문 정보 — order-detail-page.tsx 상단 블록과 동일한 3줄 구성 */}
              <div className="flex flex-col justify-center gap-1 flex-1 min-w-0">
                <span className="text-sm font-bold text-gray-900 truncate">
                  주문번호 {inquiry.order.orderNumber}
                </span>
                <span className="text-xs text-gray-500">
                  주문일시 {DateTime.fromISO(inquiry.order.createdAt).toFormat("yyyy.M.d HH:mm")}
                </span>
                {inquiry.order.paidAt && (
                  <span className="text-xs text-gray-500">
                    결제일시 {DateTime.fromISO(inquiry.order.paidAt).toFormat("yyyy.M.d HH:mm")}
                  </span>
                )}
              </div>

              {/* 상품 미리보기 — order-item-card.tsx와 같은 정보 밀도(판매자/상품명/옵션/가격)를
                  보여주되, 여기선 상품이미지를 눌러도 상품상세로 안 가고 전체 영역이 주문상세로만
                  연결돼야 해서 OrderItemCard(내부에서 상품 Link로 감쌈)를 재사용하지 않고 직접 그린다 */}
              <div className="flex justify-end gap-2 flex-1 min-w-0">
                {/* 상품상세 화면과 반대로 정보를 왼쪽, 이미지를 오른쪽에 두고 영역 자체는 우측 정렬 */}
                <div className="flex flex-col items-end text-right min-w-0">
                  <span className="text-xs text-gray-500">{inquiry.order.item.sellerName}</span>
                  <span className="text-xs font-medium text-gray-900 line-clamp-2">
                    {inquiry.order.item.productName}
                  </span>
                  {inquiry.order.item.options && (
                    <span className="text-xs text-gray-500 truncate">
                      {Object.values(inquiry.order.item.options).join(" / ")}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-gray-900">
                    {inquiry.order.item.salePrice.toLocaleString()}원 / {inquiry.order.item.quantity}개
                  </span>
                </div>
                <div className="w-16 h-16 bg-white rounded-md overflow-hidden shrink-0 border border-gray-100">
                  {inquiry.order.item.mainImage ? (
                    <img
                      src={inquiry.order.item.mainImage}
                      alt={inquiry.order.item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                      No Image
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="px-4 py-4 bg-white border-b border-gray-100 mt-2">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{inquiry.content}</p>
        </div>

        <div className="px-4 py-4 bg-white mt-2">
          <span className="text-xs font-bold text-gray-500 mb-2 block">답변</span>
          {inquiry.answer ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{inquiry.answer}</p>
              <span className="text-xs text-gray-400">{formatDate(inquiry.answeredAt)}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">아직 답변이 등록되지 않았어요.</p>
          )}
        </div>
      </div>
    </Content>
  );
}
