import { useImageError } from "~/hooks/useImageError";
import { X } from "lucide-react";
import { Link, useFetcher } from "react-router";
import type { LikedStore } from "../queries";

interface LikeStoreCardProps {
  item: LikedStore;
}

export default function LikeStoreCard({ item }: LikeStoreCardProps) {
  const { store } = item;
  const { imageError, imageRef, onError } = useImageError();
  const fetcher = useFetcher();

  const isRemoving = fetcher.state !== "idle";

  const handleRemove = () => {
    fetcher.submit(
      { intent: "unlikeStore", sellerId: item.sellerId },
      { method: "POST" }
    );
  };

  return (
    <div className="flex w-full items-center gap-3 px-5 py-4 border-b border-gray-100">
      <Link
        to={`/stores/${store.sellerCode}`}
        prefetch="intent"
        className="flex flex-1 min-w-0 items-center gap-3.5"
      >
        {store.profileImage && !imageError ? (
          <img
            src={store.profileImage}
            alt={store.name}
            className="size-[52px] shrink-0 rounded-full object-contain bg-gray-100"
            ref={imageRef}
          onError={onError}
          />
        ) : (
          <div className="size-[52px] shrink-0 rounded-full bg-navy-100 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{store.name.charAt(0)}</span>
          </div>
        )}
        <span className="flex-1 min-w-0 truncate text-[15px] font-bold text-gray-900">
          {store.name}
        </span>
      </Link>

      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        aria-label="찜한 스토어 제외"
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
