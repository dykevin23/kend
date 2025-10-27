import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { cn } from "~/lib/utils";

interface StoreCardProps {
  storeId: string;
}

export default function StoreCard({ storeId }: StoreCardProps) {
  return (
    <Link
      to={`/stores/${storeId}`}
      className="flex flex-col w-full h-34 px-4 items-start"
    >
      <StoreInfo />
      <div className="flex h-22 py-3 items-center gap-2 shrink-0 self-stretch border-b-1 border-muted/30">
        <div className="flex pr-4 items-center gap-1">
          {Array.from({ length: 6 }).map((_) => (
            <div className="flex size-18 justify-center items-center shrink-0 bg-gray-500 rounded-md"></div>
          ))}
        </div>
      </div>
    </Link>
  );
}

export const StoreInfo = () => {
  return (
    <div className="flex h-12 py-3 items-center gap-2 shrink-0 self-stretch">
      {/* profile */}
      <div className="size-10 aspect-square rounded-full bg-gray-500"></div>

      <div className="flex h-12 justify-between items-center flex-gsb">
        <Badge
          variant="secondary"
          className={cn(
            "bg-secondary/10 text-secondary",
            "flex h-6 px-2 rounded-md",
            "text-xs leading-3"
          )}
        >
          키득키득
        </Badge>

        <span className="w-[170px] text-right text-sm leading-3.5 tracking-[-0.4px]">
          #남아코디룩 #가을아동복 #후뚜루마뚜루
        </span>

        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="#FF8F20"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-heart-icon lucide-heart border-accent"
          >
            <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
          </svg>
          <span className="text-xs leading-3">3</span>
        </div>
      </div>
    </div>
  );
};
