import { Plus } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import Header from "~/common/components/header";
import { buttonVariants } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";

export default function ChildOverviewLayout() {
  return (
    <div>
      <Header title="데이터" />
      <div className="bg-muted/30">
        <div className="flex w-full py-4 pl-4 items-start gap-2">
          <div className="flex h-8 px-3 justify-center items-center gap-2.5 rounded-full bg-muted">
            <Link to="/children/submit">
              <Plus className="size-4 aspect-square" />
            </Link>
          </div>
          <div className="flex flex-col items-start gap-2.5 grow shrink-0 basis-0">
            <div className="flex pr-2 items-center gap-2 self-stretch">
              {[
                { id: 1, name: "첫째" },
                { id: 2, name: "둘째" },
                { id: 3, name: "셋째" },
              ].map((item) => (
                <NavLink
                  key={item.id}
                  className={({ isActive }) =>
                    cn(
                      buttonVariants(),
                      "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-muted text-primary"
                    )
                  }
                  to={`/children/${item.id}`}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
