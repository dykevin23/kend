import { Heart, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
}
export default function Header({ title, rightComponent }: HeaderProps) {
  return (
    <div className="flex p-4 justify-between items-center self-stretch">
      <span className="text-2xl font-bold">{title}</span>
      {rightComponent}
    </div>
  );
}
