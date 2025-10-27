import Banner from "~/common/components/banner";
import Content from "~/common/components/content";
import { StoreInfo } from "../components/store-card";
import StoreCategoryTab from "../components/store-category-tab";
import ProductCard from "~/features/products/components/product-card";

export default function StorePage() {
  return (
    <Content>
      <Banner />

      <div className="flex flex-col h-12 px-4 items-start shrink-0 self-stretch pt-2.5">
        <div className="flex flex-col pr-4 items-start shrink-0 self-stretch">
          <StoreInfo />
        </div>
      </div>

      <div className="flex flex-col w-full items-start gap-6 pt-5">
        <StoreCategoryTab />

        <div className="grid grid-cols-3 gap-1 px-0.5">
          {Array.from({ length: 15 }).map((_, index) => (
            <ProductCard
              key={`product-${index}`}
              productId={`product-${index}`}
            />
          ))}
        </div>
      </div>
    </Content>
  );
}
