import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { StoreWithProducts } from "../queries";

interface StoreCardProps {
  store: StoreWithProducts;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      to={`/stores/${store.sellerCode}`}
      prefetch="intent"
      className="flex flex-col p-4 gap-[13px] bg-white rounded-card shadow-card-sm"
    >
      <StoreInfo
        name={store.name}
        profileImage={store.profileImage}
        hashtags={store.hashtags}
        likeCount={store.likeCount}
      />
      <div className="flex gap-2 overflow-x-auto">
        {store.productImages.length > 0 ? (
          store.productImages.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`${store.name} 상품 ${index + 1}`}
              className="size-[74px] shrink-0 rounded-[14px] object-cover bg-gray-100"
            />
          ))
        ) : (
          // 상품이 없을 경우 placeholder
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex size-[74px] justify-center items-center shrink-0 bg-gray-100 rounded-[14px]"
            >
              <span className="text-xs text-gray-400">No Image</span>
            </div>
          ))
        )}
      </div>
    </Link>
  );
}

interface StoreInfoProps {
  name: string;
  profileImage: string | null;
  hashtags: string | null;
  likeCount: number;
}

export const StoreInfo = ({
  name,
  profileImage,
  hashtags,
  likeCount,
}: StoreInfoProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3">
      {/* profile */}
      {profileImage && !imageError ? (
        <img
          src={profileImage}
          alt={name}
          className="size-[46px] shrink-0 rounded-full object-contain bg-gray-100"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="size-[46px] shrink-0 rounded-full bg-navy-100 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">{name.charAt(0)}</span>
        </div>
      )}

      <div className="flex flex-1 min-w-0 flex-col gap-1">
        <span className="text-[15px] font-extrabold text-gray-900 truncate">
          {name}
        </span>
        <span className="text-xs text-gray-500 truncate">{hashtags ?? ""}</span>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <Heart className="size-[18px] fill-accent text-accent" strokeWidth={0} />
        <span className="text-[10.5px] font-bold text-gray-500">
          {likeCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
