import { Link, NavLink, Outlet } from "react-router";
import Content from "~/common/components/content";
import { buttonVariants } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";

export default function ChildrenOverviewLayout() {
  const children = [
    { child_id: "1", nickname: "첫째" },
    { child_id: "2", nickname: "둘째" },
  ];
  return (
    <Content headerPorps={{ title: "데이터" }}>
      <div className="flex flex-col w-full h-full bg-muted/10">
        {/* 자녀 선택 영역 start */}
        <div className="flex w-full py-4 pl-4 items-start gap-2">
          <Link to="/children/submit">
            <div className="flex h-8 px-3 justify-center items-center gap-2.5 rounded-full bg-muted-foreground/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clipPath="url(#clip0_1_763)">
                  <path
                    d="M15.275 7.05H8.95V0.725C8.95 0.325 8.525 0 8 0C7.475 0 7.05 0.325 7.05 0.725V7.05H0.725C0.325 7.05 0 7.475 0 8C0 8.525 0.325 8.95 0.725 8.95H7.05V15.275C7.05 15.675 7.475 16 8 16C8.525 16 8.95 15.675 8.95 15.275V8.95H15.275C15.675 8.95 16 8.525 16 8C16 7.475 15.675 7.05 15.275 7.05Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1_763">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </Link>

          <div className="flex flex-col items-start gap-2.5 flex-gsb">
            <div className="flex pr-2 items-center gap-2 self-stretch">
              {children.map((child) => (
                <NavLink
                  key={child.child_id}
                  className={({ isActive }) =>
                    cn(
                      buttonVariants(),
                      "flex h-8 px-3 justify-center items-center gap-2.5 rounded-full",
                      isActive
                        ? "bg-secondary text-white"
                        : "bg-muted-foreground/10 text-black"
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
        {/* 자녀 선택 영역 end */}

        <Outlet />
      </div>
    </Content>
  );
}
