import { Ellipsis, Heart, MapPin, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";

interface ProductCardProps {
  id: string;
  title: string;
  distance: string;
  postedAt: string;
  price: string;
  available: string;
  messagesCount: number;
  likesCount: number;
}

export default function ProductCard({
  id,
  title,
  distance,
  postedAt,
  price,
  available,
  messagesCount,
  likesCount,
}: ProductCardProps) {
  return (
    <Link to={`/products/${id}`}>
      <div className="flex px-4 flex-col items-start gap-4 self-stretch">
        <div className="flex pb-6 items-center gap-4 grow shrink-0 basis-0 self-stretch border-b border-b-muted">
          {/* 상품 이미지 영역 */}
          <div className="flex size-28 justify-center items-center aspect-square rounded-[10px] bg-muted-foreground/30"></div>

          {/* 상품 정보 영역 */}
          <div className="flex flex-col justify-between items-start grow shrink-0 basis-0 self-stretch">
            <div className="flex flex-col items-start gap-1 self-stretch">
              <span className="text-[15px] font-medium leading-5.25">
                {title}
              </span>
              <div className="flex items-center gap-1 self-stretch">
                <div className="flex items-center gap-0.5">
                  <MapPin className="size-3.5 aspect-square" />
                  <span className="text-xs font-normal leading-3">
                    {distance}
                  </span>
                </div>
                <Ellipsis className="size-0.5 aspect-square" />
                <span className="text-xs font-normal leading-3">
                  {postedAt}
                </span>
              </div>
              <span className="text-[15px] font-bold leading-5.25 tracking-tight self-stretch">
                {price}
              </span>
            </div>

            <div className="flex justify-between items-center self-stretch">
              <Badge className="flex h-6 px-2 justify-center items-center gap-2.5">
                <span className="text-xs font-normal leading-3">
                  {available}
                </span>
              </Badge>

              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  <MessageSquare className="size-4 aspect-square" />
                  <span className="text-xs font-normal leading-3">
                    {messagesCount}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Heart className="size-4 aspect-square" />
                  <span className="text-xs font-normal leading-3">
                    {likesCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
