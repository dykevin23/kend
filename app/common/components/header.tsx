import { Heart, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
}
export default function Header({ title, rightComponent }: HeaderProps) {
  return (
    <div className="flex px-4 pt-4 justify-between items-center self-stretch">
      <span className="text-2xl font-bold leading-6 tracking-tight">
        {title}
      </span>
      {rightComponent}
    </div>
  );
}
