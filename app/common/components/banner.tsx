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
}

export default function Banner({ images = [] }: BannerProps) {
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
    <div className="flex w-full min-h-36 px-4 flex-col items-start gap-2.5">
      {images.length > 0 ? (
        <div className="relative w-full">
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
                    className="w-full aspect-[16/9] object-cover rounded-2xl"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === current ? "w-3 bg-white" : "w-1.5 bg-white/50"
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
            "bg-muted/30 rounded-2xl"
          )}
        />
      )}
    </div>
  );
}
