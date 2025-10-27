import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

export interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex p-4 justify-between items-center self-stretch">
      {title ? (
        <span className="text-2xl leading-6 tracking-[-0.4px]">{title}</span>
      ) : (
        <ArrowLeft onClick={() => navigate(-1)} />
      )}
    </div>
  );
}
