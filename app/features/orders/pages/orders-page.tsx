import { useState } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import { Search } from "lucide-react";
import Content from "~/common/components/content";
import { Input } from "~/common/components/ui/input";
import { makeSSRClient } from "~/supa-client";
import { getUserOrderGroups, type OrderTabFilter } from "../queries";
import OrderGroupCard from "../components/order-group-card";
import type { Route } from "./+types/orders-page";
import { cn } from "~/lib/utils";

const ORDER_TABS: { value: OrderTabFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "payment_pending", label: "결제대기" },
  { value: "in_delivery", label: "배송중" },
  { value: "delivered", label: "배송완료" },
  { value: "cancelled", label: "취소/환불" },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { orderGroups: [] };
  }

  const url = new URL(request.url);
  const filter = (url.searchParams.get("filter") as OrderTabFilter) || "all";

  const orderGroups = await getUserOrderGroups(client, user.id, filter);

  return { orderGroups };
};

export default function OrdersPage() {
  const { orderGroups } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState("");

  const currentFilter = (searchParams.get("filter") as OrderTabFilter) || "all";

  const handleTabChange = (filter: OrderTabFilter) => {
    setSearchParams({ filter }, { replace: true });
  };

  // 검색어로 필터링 (상품명 기준)
  const filteredOrderGroups = searchKeyword
    ? orderGroups.filter((group) =>
        group.orders.some((order) =>
          order.items.some((item) =>
            item.productName.toLowerCase().includes(searchKeyword.toLowerCase())
          )
        )
      )
    : orderGroups;

  return (
    <Content headerPorps={{ title: "주문/배송", useRight: false }}>
      <div className="flex flex-col w-full bg-gray-50 min-h-full">
        {/* 검색 영역 */}
        <div className="px-4 py-3 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="주문한 상품을 검색해보세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-9 bg-gray-100 border-0"
            />
          </div>
        </div>

        {/* 탭 영역 */}
        <div className="flex items-center bg-white border-b border-gray-200 overflow-x-auto">
          {ORDER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "flex-1 min-w-fit px-4 py-3 text-sm font-medium whitespace-nowrap",
                "border-b-2 transition-colors",
                currentFilter === tab.value
                  ? "border-secondary text-secondary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 주문 목록 - order_groups 간 회색 영역으로 구분 */}
        <div className="flex flex-col">
          {filteredOrderGroups.length > 0 ? (
            filteredOrderGroups.map((orderGroup, index) => (
              <div key={orderGroup.id}>
                {/* order_groups 간 구분 영역 */}
                {index > 0 && <div className="h-3 bg-gray-100" />}
                <OrderGroupCard orderGroup={orderGroup} />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white">
              <span className="text-sm">주문 내역이 없습니다.</span>
            </div>
          )}
        </div>
      </div>
    </Content>
  );
}
