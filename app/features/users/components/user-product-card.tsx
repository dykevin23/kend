import { Ellipsis } from "lucide-react";
import { DateTime } from "luxon";
import { formatCurrency } from "~/lib/utils";

interface UserProductCardProps {
  id: number;
  title: string;
  postedAt: string;
  price: number;
  status: "ongoing" | "done";
  isMe: boolean;
  image: string;
}

export default function UserProductCard({
  id,
  title,
  postedAt,
  price,
  status,
  isMe,
  image,
}: UserProductCardProps) {
  return (
    <div className="flex pb-6 items-start gap-4 grow shrink-0 basis-0 self-stretch">
      {/* 상품 이미지 영역 */}
      <div className="flex size-28 justify-center items-center aspect-square rounded-[10px] overflow-hidden">
        <img src={image} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col justify-between items-start grow shrink-0 basis-0 self-stretch">
        <div className="flex flex-col items-start gap-4 grow shrink-0 basis-0 self-stretch">
          <div className="flex flex-col items-start gap-2 self-stretch">
            <span className="text-[15px] font-medium leading-[21px] text-ellipsis">
              {title}
            </span>
            <div className="flex items-center gap-1 self-stretch">
              <span className="text-xs text-muted-foreground/50">
                {DateTime.fromISO(postedAt).toRelative()}
              </span>
            </div>
          </div>
          <div className="self-stretch">
            <span className="text-[15px] font-bold leading-[21px]">
              {`${formatCurrency(price)}원`}
            </span>
          </div>
        </div>
      </div>

      {!isMe && (
        <Ellipsis className="size-6 rounded-[6px] bg-muted-foreground/50 px-1" />
      )}
    </div>
  );
}
