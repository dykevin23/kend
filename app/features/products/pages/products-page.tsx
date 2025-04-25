import Header from "~/common/components/header";
import ProductCard from "../components/product-card";
import FloatingButton from "~/common/components/floating-button";
import { Heart, Search } from "lucide-react";
import { Link } from "react-router";

export default function ProductsPage() {
  return (
    <div>
      <Header
        title="거래하기"
        rightComponent={
          <div className="flex items-center gap-6">
            <Search className="size-7" />
            <Link to="likes">
              <Heart className="size-7" />
            </Link>
          </div>
        }
      />
      <div>
        {Array.from({ length: 10 }).map((_, index) => (
          <ProductCard
            key={`product-${index}`}
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

      <FloatingButton />
    </div>
  );
}
