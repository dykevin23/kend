import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link } from "react-router";
import { useState } from "react";
import CloseFloatingIcon from "~/assets/icons/closeFloatingIcon";
import PlusFloatingIcon from "~/assets/icons/plusFloatingIcon";
import { cn } from "~/lib/utils";

export default function FloatingButton() {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className={cn({ "w-full h-full fixed left-0 top-0 z-10": open })}>
      {/* <div className="w-full h-full absolute bg-black/40" /> */}
      <DropdownMenu
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <DropdownMenuTrigger className="fixed bottom-14 right-4">
          {open ? <CloseFloatingIcon /> : <PlusFloatingIcon />}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="flex w-[200px] px-4 py-5 flex-col justify-end items-start gap-5 rounded-2xl"
        >
          <Link to="/products/submit">
            <DropdownMenuLabel className="flex w-[160px] items-center gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M7.10997 11.52L6.39997 16.46C6.32597 17.05 6.68997 17.6 7.53997 17.6L12.48 16.89C12.6954 16.8613 12.8956 16.763 13.05 16.61C13.129 16.531 20.88 8.78698 20.95 8.69998C24.392 4.89798 18.975 -0.289017 15.3 3.04998C15.213 3.11998 7.46797 10.872 7.38997 10.95C7.23694 11.1043 7.13861 11.3045 7.10997 11.52ZM18 4.01998C18.2619 4.01653 18.5219 4.06524 18.7648 4.16327C19.0077 4.26131 19.2286 4.4067 19.4148 4.59099C19.6009 4.77527 19.7485 4.99476 19.849 5.23666C19.9495 5.47857 20.0008 5.73805 20 5.99998C20.0006 6.4267 19.86 6.84162 19.6 7.17998L16.82 4.39998C17.161 4.14734 17.5756 4.01382 18 4.01998ZM9.03997 12.13L15.38 5.79998L18.2 8.61998L11.87 14.96L8.56997 15.43L9.03997 12.13Z"
                  fill="black"
                />
                <path
                  d="M19 13.125V17C18.9992 17.7954 18.6829 18.558 18.1204 19.1204C17.558 19.6829 16.7954 19.9992 16 20H7C6.20459 19.9992 5.44199 19.6829 4.87956 19.1204C4.31712 18.558 4.00079 17.7954 4 17V8C4.00079 7.20459 4.31712 6.44199 4.87956 5.87956C5.44199 5.31712 6.20459 5.00079 7 5H10.969C11.2342 5 11.4886 4.89464 11.6761 4.70711C11.8636 4.51957 11.969 4.26522 11.969 4C11.969 3.73478 11.8636 3.48043 11.6761 3.29289C11.4886 3.10536 11.2342 3 10.969 3H7C5.67441 3.00159 4.40356 3.52888 3.46622 4.46622C2.52888 5.40356 2.00159 6.67441 2 8V17C2.00159 18.3256 2.52888 19.5964 3.46622 20.5338C4.40356 21.4711 5.67441 21.9984 7 22H16C17.3256 21.9984 18.5964 21.4711 19.5338 20.5338C20.4711 19.5964 20.9984 18.3256 21 17V13.125C21 12.8598 20.8946 12.6054 20.7071 12.4179C20.5196 12.2304 20.2652 12.125 20 12.125C19.7348 12.125 19.4804 12.2304 19.2929 12.4179C19.1054 12.6054 19 12.8598 19 13.125Z"
                  fill="black"
                />
              </svg>
              <span className="text-sm font-medium leading-5 tracking-[0.3px]">
                게시글 작성하기
              </span>
            </DropdownMenuLabel>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
