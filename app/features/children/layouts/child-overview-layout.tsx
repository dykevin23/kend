import { Heart, Plus, Search } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import Header from "~/common/components/header";
import { buttonVariants } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/child-overview-layout";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getChildren } from "../queries";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const children = await getChildren(client, { userId });

  return {
    children,
    child: children.find((child) => child.child_id === Number(params.childId)),
  };
};

export default function ChildOverviewLayout({
  loaderData,
}: Route.ComponentProps) {
  return (
    <div className="space-y-6">
      <Header
        title="데이터"
        rightComponent={
          <div className="flex items-center gap-6">
            <Search className="size-7 aspect-square" />
            <Link to="likes">
              <Heart className="size-7 aspect-square" />
            </Link>
          </div>
        }
      />
      <div className="bg-muted/70">
        <div className="flex w-full py-4 pl-4 items-start gap-2">
          <div className="flex h-8 px-3 justify-center items-center gap-2.5 rounded-full bg-muted-foreground/10">
            <Link to="/children/submit">
              <Plus className="size-4 aspect-square" />
            </Link>
          </div>
          <div className="flex flex-col items-start gap-2.5 grow shrink-0 basis-0">
            <div className="flex pr-2 items-center gap-2 self-stretch">
              {loaderData.children.map((child) => (
                <NavLink
                  key={child.child_id}
                  className={({ isActive }) =>
                    cn(
                      buttonVariants(),
                      "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-muted-foreground/10 text-primary"
                    )
                  }
                  to={`/children/${child.child_id}`}
                >
                  {child.nickname}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <Outlet context={{ child: loaderData.child }} />
      </div>
    </div>
  );
}
