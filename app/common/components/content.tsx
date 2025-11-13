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
    <div>
      <Header {...headerPorps} />
      <div className={cn({ "mb-20": footer })}>{children}</div>
      {footer && <BottomButtonArea>{footer}</BottomButtonArea>}
    </div>
  );
}
