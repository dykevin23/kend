import Header from "~/common/components/header";
import ProductCard from "../components/product-card";
import FloatingButton from "~/common/components/floating-button";
import { Heart, Search } from "lucide-react";
import { Link, useFetcher, useNavigation, useSearchParams } from "react-router";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/common/components/ui/carousel";
import type { Route } from "./+types/products-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getProducts, getProductsPages } from "../queries";
import { useEffect, useRef, useState } from "react";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const url = new URL(request.url);

  const page = Number(url.searchParams.get("page")) || 1;
  const products = await getProducts(client, {
    page,
    userId,
  });
  const totalPages = await getProductsPages(client, { userId });

  return { products, page, totalPages };
};

export default function ProductsPage({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const hasMoreListRef = useRef<HTMLDivElement | null>(null);
  const [products, setProducts] = useState(loaderData.products);
  const [hasMore, setHasMore] = useState<boolean>(
    loaderData.totalPages > loaderData.page
  );
  const isLoading = fetcher.state === "loading";

  useEffect(() => {
    if (fetcher.state === "idle") {
      if (fetcher.data) {
        setProducts([...products, ...fetcher.data.products]);
        setHasMore(fetcher.data.totalPages > fetcher.data.page);
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (!hasMore || !hasMoreListRef.current || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetcher.load(`/products?page=${loaderData.page + 1}`);
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    observer.observe(hasMoreListRef.current);

    return () => {
      if (hasMoreListRef.current) observer.unobserve(hasMoreListRef.current);
    };
  }, [hasMore, isLoading]);

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
        {products.map((product) => (
          <ProductCard
            key={product.product_id}
            id={product.product_id}
            title={product.name}
            distance="2.1km 이내"
            postedAt={product.updated_at}
            price={product.price}
            available="9개월 사용가능"
            messagesCount={product.chats}
            likesCount={product.likes}
            image={product.product_image}
          />
        ))}
      </div>

      {hasMore && <div ref={hasMoreListRef}></div>}

      <FloatingButton />
    </div>
  );
}
