import { Link, NavLink, Outlet, useLoaderData } from "react-router";
import Content from "~/common/components/content";
import { buttonVariants } from "~/common/components/ui/button";
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
    <Content headerPorps={{ title: "데이터" }}>
      <div className="flex flex-col w-full h-full bg-muted/10 pb-20">
        {/* 자녀 선택 영역 */}
        <div className="flex w-full py-4 pl-4 items-start gap-2">
          {/* + 버튼 */}
          <Link to="/children/submit">
            <div className="flex h-8 px-3 justify-center items-center gap-2.5 rounded-full bg-muted-foreground/10">
              <Plus size={16} />
            </div>
          </Link>

          {/* 자녀 탭 목록 */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex pr-4 items-center gap-2">
              {children.map((child) => (
                <NavLink
                  key={child.id}
                  className={({ isActive }) =>
                    cn(
                      buttonVariants(),
                      "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full whitespace-nowrap",
                      isActive
                        ? "bg-secondary text-white"
                        : "bg-muted-foreground/10 text-black"
                    )
                  }
                  to={`/children/${child.code}`}
                >
                  {child.nickname}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* 자녀가 없는 경우 */}
        {children.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 px-4">
            <p className="text-muted-foreground text-center mb-4">
              등록된 자녀가 없습니다.
            </p>
            <Link
              to="/children/submit"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "rounded-full"
              )}
            >
              자녀 등록하기
            </Link>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </Content>
  );
}
