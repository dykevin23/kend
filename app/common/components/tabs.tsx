import { cn } from "~/lib/utils";

interface TabsProps {
  children: React.ReactNode;
  /** 탭이 많을 때: 균등 분할 대신 좌측 정렬 + 가로 스크롤 */
  scrollable?: boolean;
  className?: string;
}

export const Tabs = ({ children, scrollable = false, className }: TabsProps) => {
  return (
    <div className={cn("flex flex-col w-full items-start", className)}>
      <div
        className={cn(
          "flex w-full items-center border-b border-gray-100 bg-white",
          scrollable &&
            "gap-[22px] px-5 overflow-x-auto [&>*]:grow-0 [&>*]:basis-auto [&>*]:px-0.5"
        )}
      >
        {children}
      </div>
    </div>
  );
};

interface TabProps {
  title: string;
  isActive: boolean;
  className?: string | object;
  onClick: () => void;
}

export const Tab = ({ title, isActive, className, onClick }: TabProps) => {
  const handleClick = () => {
    if (!isActive) onClick();
  };

  return (
    <div
      className="relative flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0 whitespace-nowrap"
      onClick={handleClick}
    >
      <span
        className={cn(
          "text-sm",
          isActive ? "font-extrabold text-primary" : "font-semibold text-gray-500",
          className
        )}
      >
        {title}
      </span>
      {isActive && (
        <span className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-primary" />
      )}
    </div>
  );
};
