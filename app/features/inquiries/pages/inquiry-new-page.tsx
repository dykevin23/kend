import { useEffect, useState } from "react";
import { redirect, useFetcher, useLoaderData, useNavigate } from "react-router";
import { DateTime } from "luxon";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import { cn } from "~/lib/utils";
import { makeSSRClient } from "~/supa-client";
import { getUserOrderGroupsForPicker } from "../queries";
import { createInquiry } from "../mutations";
import { INQUIRY_CATEGORY_LABELS } from "../utils";
import type { InquiryCategory } from "../types";
import type { Route } from "./+types/inquiry-new-page";

const NO_ORDER_VALUE = "none";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw redirect("/auth/login");
  }

  const orderGroups = await getUserOrderGroupsForPicker(client, user.id);

  return { orderGroups };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const formData = await request.formData();
  const category = formData.get("category") as InquiryCategory;
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const orderItemId = (formData.get("orderItemId") as string) || null;

  if (!category || !title || !content) {
    return { success: false, error: "카테고리, 제목, 내용을 모두 입력해 주세요." };
  }

  try {
    const result = await createInquiry(client, {
      userId: user.id,
      category,
      title,
      content,
      orderItemId,
    });
    return { success: true, inquiryId: result.inquiryId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "문의 등록에 실패했습니다.",
    };
  }
};

export default function InquiryNewPage() {
  const { orderGroups } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<InquiryCategory | "">("");
  const [orderGroupId, setOrderGroupId] = useState(NO_ORDER_VALUE);
  const [orderItemId, setOrderItemId] = useState("");
  const isSubmitting = fetcher.state !== "idle";

  const selectedGroup = orderGroups.find((group) => group.id === orderGroupId);

  // 등록 성공 시 "새 문의" 페이지를 히스토리에서 대체하고 상세로 이동 —
  // 뒤로가기 시 작성 폼이 아니라 목록으로 가야 하므로
  useEffect(() => {
    if (fetcher.data?.success) {
      navigate(`/myPage/inquiries/${fetcher.data.inquiryId}`, { replace: true });
    }
  }, [fetcher.data, navigate]);

  return (
    <Content headerPorps={{ title: "문의하기", useRight: false }}>
      <fetcher.Form method="post" className="flex flex-col w-full">
        <div className="flex flex-col gap-4 px-4 py-4">
          {fetcher.data?.success === false && (
            <div className="px-3 py-2 rounded-md bg-red-50 text-xs text-red-600">
              {fetcher.data.error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">카테고리</label>
            <Select
              name="category"
              value={category}
              onValueChange={(value) => setCategory(value as InquiryCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INQUIRY_CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 1단계: 관련 주문 선택 — 폼에 직접 제출되지 않고, 2단계(상품) 목록을 좁히는 용도 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">관련 주문 (선택)</label>
            <Select
              value={orderGroupId}
              onValueChange={(value) => {
                setOrderGroupId(value);
                setOrderItemId(""); // 주문이 바뀌면 이전에 고른 상품 선택은 초기화
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="관련 주문을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-2rem)]">
                <SelectItem value={NO_ORDER_VALUE}>선택 안 함</SelectItem>
                {orderGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {/* 부모(ItemText)가 flex 컨테이너가 아니라 flex-grow가 안 먹어서,
                        고정 너비 + grid로 구성 — 1fr 칸(상품명)이 남는 공간을 갖고
                        나머지(구분자/날짜/주문번호)는 자기 크기만큼만 차지한다 */}
                    <span className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,5rem)] items-center gap-1 w-64 max-w-full">
                      <span className="truncate min-w-0">
                        {group.items[0]?.productName ?? "상품 정보 없음"}
                        {group.items.length > 1 ? ` 외 ${group.items.length - 1}건` : ""}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="whitespace-nowrap text-muted-foreground">
                        {DateTime.fromISO(group.createdAt).toFormat("yyyy.M.d")}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="truncate min-w-0 text-muted-foreground">
                        {group.orderNumber}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2단계: 위에서 고른 주문에 속한 상품만 나열 — 판매자를 특정하려면
              결국 상품(order_item) 단위까지 내려가야 해서 필수 선택 */}
          {selectedGroup && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">상품 선택</label>
              <Select
                name="orderItemId"
                value={orderItemId}
                onValueChange={setOrderItemId}
              >
                <SelectTrigger className="w-full h-auto py-2">
                  <SelectValue placeholder="문의할 상품을 선택하세요" />
                </SelectTrigger>
                <SelectContent className="max-w-[calc(100vw-2rem)]">
                  {selectedGroup.items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {/* SelectTrigger가 선택된 값에 display:flex를 강제로 씌우기 때문에
                          (닫힌 상태에서만) grid 대신 처음부터 flex로 맞춰서 열림/닫힘 둘 다
                          동일하게 렌더링되게 한다 */}
                      <span className="flex items-center gap-2 w-64 max-w-full">
                        <span className="w-8 h-8 rounded overflow-hidden shrink-0 bg-gray-100">
                          {item.mainImage ? (
                            <img
                              src={item.mainImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </span>
                        <span className="flex flex-col min-w-0 flex-1 text-left">
                          <span className="text-xs text-gray-500 truncate">{item.sellerName}</span>
                          <span className="truncate">{item.productName}</span>
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-muted-foreground">
                          {item.salePrice.toLocaleString()}원
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">제목</label>
            <Input name="title" placeholder="제목을 입력하세요" required maxLength={100} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500">내용</label>
            <textarea
              name="content"
              placeholder="문의 내용을 입력하세요"
              required
              rows={8}
              className={cn(
                "border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none resize-none",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              )}
            />
          </div>
        </div>

        <div className="px-4 pb-6">
          <Button
            type="submit"
            className="w-full"
            disabled={
              !category || isSubmitting || (!!selectedGroup && !orderItemId)
            }
          >
            {isSubmitting ? "등록 중..." : "문의 등록"}
          </Button>
        </div>
      </fetcher.Form>
    </Content>
  );
}
