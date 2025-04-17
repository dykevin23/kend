import { Heart, Search } from "lucide-react";

export default function Header() {
  return (
    <div className="flex p-4 justify-between items-center self-stretch">
      <span className="text-2xl font-bold">거래하기</span>
      <div className="flex items-center gap-6">
        <Search className="size-7" />
        <Heart className="size-7" />
      </div>
    </div>
  );
}
