import { forwardRef } from "react";
import { productSample1 } from "~/assets/images";

interface ProductInformationSectionProps {
  productName: string;
  descriptionImages: string[];
}

const ProductInformationSection = forwardRef<
  HTMLDivElement,
  ProductInformationSectionProps
>(({ productName, descriptionImages }, ref) => {
  return (
    <div
      ref={ref}
      className="flex flex-col justify-center items-center gap-2.5 self-stretch"
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
  );
});

ProductInformationSection.displayName = "ProductInformationSection";

export default ProductInformationSection;
