import { cn } from "~/lib/utils";
import BottomButtonArea from "./bottom-button-area";
import type { HeaderProps } from "./header";
import Header from "./header";

interface ContentProps {
  children: React.ReactNode;
  headerPorps?: HeaderProps;
  footer?: React.ReactNode;
}

export default function Content({
  children,
  headerPorps,
  footer,
}: ContentProps) {
  return (
    <div className="flex flex-col w-full h-screen overflow-x-hidden">
      <Header {...headerPorps} />
      <main data-slot="content-main" className="flex-1 min-h-0 overflow-y-auto w-full">
        <div className={cn({ "pb-[5.5rem]": footer })}>{children}</div>
      </main>
      {footer && <BottomButtonArea>{footer}</BottomButtonArea>}
    </div>
  );
}
