import SubHeader from "~/common/components/sub-header";
import ProductCard from "../components/product-card";

export default function LikeProductsPage() {
  return (
    <div>
      <SubHeader title="좋아요" />
      <div className="flex w-full flex-col gap-6 pb-10">
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
    </div>
  );
}
