import { useState } from "react";
import { X } from "lucide-react";
import { Link, useFetcher } from "react-router";
import type { LikedStore } from "../queries";

interface LikeStoreCardProps {
  item: LikedStore;
}

export default function LikeStoreCard({ item }: LikeStoreCardProps) {
  const { store } = item;
  const [imageError, setImageError] = useState(false);
  const fetcher = useFetcher();

  const isRemoving = fetcher.state !== "idle";

  const handleRemove = () => {
    fetcher.submit(
      { intent: "unlikeStore", sellerId: item.sellerId },
      { method: "POST" }
    );
  };

  return (
    <div className="flex w-full items-center gap-3 px-4 py-4 border-b-1 border-b-muted/30">
      <Link
        to={`/stores/${store.sellerCode}`}
        prefetch="intent"
        className="flex flex-1 min-w-0 items-center gap-4"
      >
        {store.profileImage && !imageError ? (
          <img
            src={store.profileImage}
            alt={store.name}
            className="size-12 shrink-0 rounded-full object-contain bg-gray-100"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="size-12 shrink-0 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs text-muted">{store.name.charAt(0)}</span>
          </div>
        )}
        <span className="flex-1 min-w-0 truncate text-base leading-[140%]">
          {store.name}
        </span>
      </Link>

      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label="찜한 스토어 제외"
        className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-muted/10"
      >
        <X className="size-4 text-muted" />
      </button>
    </div>
  );
}
