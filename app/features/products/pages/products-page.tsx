import Header from "~/common/components/header";
import ProductCard from "../components/product-card";
import FloatingButton from "~/common/components/floating-button";
import { Heart, Search } from "lucide-react";
import { Link } from "react-router";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/common/components/ui/carousel";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <Header
        title="거래하기"
        rightComponent={
          <div className="flex items-center gap-6">
            <Search className="size-7 aspect-square" />
            <Link to="likes">
              <Heart className="size-7 aspect-square" />
            </Link>
          </div>
        }
      />

      {/* <Carousel
        opts={{ align: "center", loop: true }}
        className="flex w-full px-4 flex-col items-start gap-2.5"
      >
        <CarouselContent className="flex justify-center">
          <CarouselItem>
            <div className="flex w-[330px] h-[150px] justify-end items-center rounded-2xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.15)] bg-red-500"></div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex w-[330px] h-[150px] justify-end items-center rounded-2xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.15)] bg-blue-500"></div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex w-[330px] h-[150px] justify-end items-center rounded-2xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.15)] bg-green-500"></div>
          </CarouselItem>
        </CarouselContent>
      </Carousel> */}

      <div className="flex w-full px-4 flex-col items-start gap-2.5">
        <div className="flex w-full h-[150px] justify-end items-center rounded-2xl shadow-[0_4px_20px_0px_rgba(0,0,0,0.15)] bg-muted-foreground/30"></div>
      </div>

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

      <FloatingButton />
    </div>
  );
}
