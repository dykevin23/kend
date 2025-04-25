import { Heart, Search } from "lucide-react";

export default function Header({ title }: { title: string }) {
  return (
    <div className="flex p-4 justify-between items-center self-stretch">
      <span className="text-2xl font-bold">{title}</span>
      <div className="flex items-center gap-6">
        <Search className="size-7" />
        <Heart className="size-7" />
      </div>
    </div>
  );
}
