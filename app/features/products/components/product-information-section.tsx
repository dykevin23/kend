import { forwardRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { productSample1 } from "~/assets/images";
import { cn } from "~/lib/utils";

interface ProductInformationSectionProps {
  productName: string;
  descriptionImages: string[];
  /** 접힌 상태에서 보여줄 높이 (기본값: 500px) */
  collapsedHeight?: number;
}

const ProductInformationSection = forwardRef<
  HTMLDivElement,
  ProductInformationSectionProps
>(({ productName, descriptionImages, collapsedHeight = 500 }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div ref={ref} className="relative w-full">
      {/* 컨텐츠 영역 */}
      <div
        className={cn(
          "flex flex-col justify-center items-center gap-2.5 self-stretch overflow-hidden transition-all duration-500"
        )}
        style={{
          maxHeight: isExpanded ? "none" : `${collapsedHeight}px`,
        }}
      >
        {descriptionImages.length > 0 ? (
          descriptionImages.map((imageUrl, index) => (
            <img
              key={index}
              className="w-full"
              src={imageUrl}
              alt={`${productName} 상세 ${index + 1}`}
            />
          ))
        ) : (
          <img className="w-full" src={productSample1} alt="" />
        )}
      </div>

      {/* 더보기 버튼 영역 (접힌 상태에서만 표시) */}
      {!isExpanded && (
        <div className="relative">
          {/* 그라데이션 오버레이 */}
          <div className="absolute bottom-full left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />

          {/* 더보기 버튼 */}
          <div className="flex justify-center py-4 bg-white">
            <button
              onClick={() => setIsExpanded(true)}
              className={cn(
                "flex items-center justify-center gap-1 w-full mx-4 py-3",
                "bg-white border border-muted/30 rounded-lg",
                "text-sm font-medium text-secondary",
                "hover:bg-gray-50 active:bg-gray-100 transition-colors"
              )}
            >
              더보기
              <ChevronDown className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ProductInformationSection.displayName = "ProductInformationSection";

export default ProductInformationSection;
