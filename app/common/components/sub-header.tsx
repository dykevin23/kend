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
        "flex p-4 w-full z-10 justify-between items-center self-stretch",
        absolute && "absolute",
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
