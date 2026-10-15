import { useState, useEffect } from "react";
import { cn } from "~/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/common/components/ui/carousel";

interface BannerProps {
  images?: string[];
  /** card: 여백 안의 둥근 카드(스토어 목록) / hero: 화면 폭 꽉 채움(스토어 상세 상단) */
  variant?: "card" | "hero";
}

export default function Banner({ images = [], variant = "card" }: BannerProps) {
  const isHero = variant === "hero";
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className={cn("flex w-full flex-col items-start", !isHero && "px-5")}>
      {images.length > 0 ? (
        <div
          className={cn(
            "relative w-full overflow-hidden",
            !isHero && "rounded-card shadow-[0_10px_24px_rgba(15,33,56,0.22)]"
          )}
        >
          <Carousel
            className="w-full"
            setApi={setApi}
            opts={{ loop: true }}
          >
            <CarouselContent className="ml-0">
              {images.map((url, index) => (
                <CarouselItem key={index} className="pl-0">
                  <img
                    src={url}
                    alt={`배너 ${index + 1}`}
                    className="w-full aspect-[16/9] object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {images.length > 1 && (
            <div
              className={cn(
                "absolute bottom-4 flex gap-[5px]",
                isHero ? "left-1/2 -translate-x-1/2" : "left-[22px]"
              )}
            >
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    index === current ? "w-4 bg-white" : "w-1 bg-white/40"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "flex justify-end items-center w-full aspect-[16/9]",
            "bg-linear-135 from-navy-900 via-navy-700 to-navy-600",
            !isHero && "rounded-card"
          )}
        />
      )}
    </div>
  );
}
