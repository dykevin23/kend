import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export default function SubHeader({
  title,
  rightComponent,
}: {
  title?: string;
  rightComponent?: React.ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex p-4 justify-between items-center self-stretch">
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
