import { cn } from "~/lib/utils";

export const Tabs = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col w-full items-start">
      <div className="flex w-full items-center border-b border-gray-100 bg-white">
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
      className="relative flex h-12 justify-center items-center gap-2 grow shrink-0 basis-0"
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
        <span className="absolute inset-x-3 bottom-0 h-[2.5px] rounded-full bg-primary" />
      )}
    </div>
  );
};
