import { Heart, MapPin, MessageSquare } from "lucide-react";
import Header from "~/common/components/header";
import { Badge } from "~/common/components/ui/badge";
import { Separator } from "~/common/components/ui/separator";
import ProductCard from "../components/product-card";

export default function ProductPage() {
  return (
    <div>
      <Header />
      {Array.from({ length: 10 }).map((_, index) => (
        <ProductCard
          id={`product-${index}`}
          title="몽클레어 키즈"
          distance="2.1km 이내"
          postedAt="3일전"
          price="320,000원"
          available="9개월 사용가능"
          messagesCount={3}
          likesCount={11}
        />
      ))}
    </div>
  );
}
