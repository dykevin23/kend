import { Heart, MapPin, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/common/components/ui/badge";
import { Separator } from "~/common/components/ui/separator";

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
      <div className="flex px-4 py-0 items-start gap-4 self-stretch">
        <div className="flex flex-col items-center grow pb-6 self-stretch">
          <div className="flex pb-6 gap-4 self-stretch">
            <div className="flex size-[112px] justify-center items-center aspect-square bg-gray-400/50 rounded-[10px]">
              image
            </div>
            <div className="flex flex-col justify-between items-start grow self-stretch">
              <div className="flex flex-col items-start gap-1 self-stretch">
                <span className="text-[15px] font-medium leading-[21px]">
                  {title}
                </span>
                <div className="flex items-center gap-1 self-stretch">
                  <div className="flex items-center gap-0.5">
                    <MapPin className="size-3.5" />
                    <span className="text-xs leading-3">{distance}</span>
                  </div>
                  ·<span className="text-xs leading-3">{postedAt}</span>
                </div>
                <span className="text-[15px] font-bold leading-[21px]">
                  {price}
                </span>
              </div>
              <div className="flex justify-between items-center self-stretch">
                <Badge className="text-primary bg-primary-foreground rounded-sm font-normal">
                  {available}
                </Badge>

                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    <MessageSquare className="size-4" />
                    <span className="text-xs leading-3">{messagesCount}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Heart className="size-4" />
                    <span className="text-xs leading-3">{likesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator />
        </div>
      </div>
    </Link>
  );
}
