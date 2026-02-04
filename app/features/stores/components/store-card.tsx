import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { cn } from "~/lib/utils";
import type { StoreWithProducts } from "../queries";

interface StoreCardProps {
  store: StoreWithProducts;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      to={`/stores/${store.sellerCode}`}
      className="flex flex-col w-full h-34 px-4 items-start"
    >
      <StoreInfo
        name={store.name}
        profileImage={store.profileImage}
        hashtags={store.hashtags}
        followerCount={store.followerCount}
      />
      <div className="flex h-22 py-3 items-center gap-2 shrink-0 self-stretch border-b-1 border-muted/30">
        <div className="flex pr-4 items-center gap-1 overflow-x-auto">
          {store.productImages.length > 0 ? (
            store.productImages.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`${store.name} 상품 ${index + 1}`}
                className="size-18 shrink-0 rounded-md object-cover border border-muted/20"
              />
            ))
          ) : (
            // 상품이 없을 경우 placeholder
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex size-18 justify-center items-center shrink-0 bg-gray-200 rounded-md"
              >
                <span className="text-xs text-muted">No Image</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Link>
  );
}

interface StoreInfoProps {
  name: string;
  profileImage: string | null;
  hashtags: string | null;
  followerCount: number;
}

export const StoreInfo = ({
  name,
  profileImage,
  hashtags,
  followerCount,
}: StoreInfoProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex h-12 py-3 items-center gap-2 shrink-0 self-stretch">
      {/* profile */}
      {profileImage && !imageError ? (
        <img
          src={profileImage}
          alt={name}
          className="size-10 aspect-square rounded-full object-contain"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="size-10 aspect-square rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-xs text-muted">{name.charAt(0)}</span>
        </div>
      )}

      <div className="flex h-12 justify-between items-center flex-gsb">
        <Badge
          variant="secondary"
          className={cn(
            "bg-secondary/10 text-secondary",
            "flex h-6 px-2 rounded-md",
            "text-xs leading-3"
          )}
        >
          {name}
        </Badge>

        <span className="w-[170px] text-right text-sm leading-3.5 tracking-[-0.4px] line-clamp-2 break-keep">
          {hashtags ?? ""}
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
          <span className="text-xs leading-3">{followerCount}</span>
        </div>
      </div>
    </div>
  );
};
