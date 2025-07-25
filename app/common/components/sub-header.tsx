import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "~/lib/utils";

export default function SubHeader({
  title,
  rightComponent,
  absolute,
}: {
  title?: string;
  rightComponent?: React.ReactNode;
  absolute?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div
      className={cn([
        "flex h-11 px-4 w-full justify-between items-center self-stretch",
        absolute && "absolute z-10",
      ])}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-7 justify-center items-center">
          <ArrowLeft onClick={() => navigate(-1)} />
        </div>
        {title ? (
          <span className="text-base font-medium leading-4">{title}</span>
        ) : null}
      </div>
      {rightComponent}
    </div>
  );
}
