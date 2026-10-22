import { Link, NavLink, Outlet, useLoaderData } from "react-router";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import { makeSSRClient } from "~/supa-client";
import { getChildren } from "../queries";
import type { Route } from "./+types/children-overview-layout";
import { Plus } from "lucide-react";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { children: [] };
  }

  try {
    const children = await getChildren(client, user.id);
    return { children };
  } catch (error) {
    console.error("Failed to load children:", error);
    return { children: [] };
  }
};

export default function ChildrenOverviewLayout() {
  const { children } = useLoaderData<typeof loader>();

  return (
    <Content headerPorps={{ title: "성장기록" }} className="bg-gray-50">
      <div className="flex flex-col w-full min-h-full pb-20">
        {/* 자녀 선택 영역 */}
        <div className="flex w-full items-center gap-2 px-5 py-3 bg-white">
          {/* + 버튼 */}
          <Link
            to="/children/submit"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-primary"
            aria-label="자녀 추가"
          >
            <Plus className="size-4" strokeWidth={2.2} />
          </Link>

          {/* 자녀 탭 목록 */}
          <div className="flex flex-1 items-center gap-2 overflow-x-auto pr-1">
            {children.map((child) => (
              <NavLink
                key={child.id}
                className={({ isActive }) =>
                  cn(
                    "flex h-8 shrink-0 items-center px-3.5 rounded-full text-[13px] font-bold whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-700"
                  )
                }
                to={`/children/${child.code}`}
              >
                {child.nickname}
              </NavLink>
            ))}
          </div>
        </div>

        {/* 자녀가 없는 경우 */}
        {children.length === 0 ? (
          <div className="px-5 pt-4">
            <div className="flex flex-col items-center gap-4 py-14 bg-white rounded-card shadow-card-sm">
              <p className="text-sm text-gray-500">등록된 자녀가 없습니다.</p>
              <Button asChild>
                <Link to="/children/submit">자녀 등록하기</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </Content>
  );
}
