import { cn } from "~/lib/utils";

export const Tabs = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col w-full items-start">
      <div className="flex w-full items-center">{children}</div>
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
      className={cn(
        "flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0",
        { "border-b-2 border-b-secondary": isActive }
      )}
      onClick={handleClick}
    >
      <span className={cn("text-base leading-4 tracking-[-0.4px]", className)}>
        {title}
      </span>
    </div>
  );
};
