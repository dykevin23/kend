import Header from "~/common/components/header";
import ProductCard from "../components/product-card";
import FloatingButton from "~/common/components/floating-button";

export default function ProductPage() {
  return (
    <div>
      <Header title="거래하기" />
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
