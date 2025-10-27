interface ProductCardProps {
  productId: string;
}

export default function ProductCard({ productId }: ProductCardProps) {
  return (
    <div className="flex w-full h-60 flex-col items-center gap-2 shrink-0">
      <div className="w-full h-37 shrink-0 bg-gray-500"></div>
      <div className="flex w-full h-3.5 px-2.5 justify-between items-center shrink-0">
        <span className="text-xs leading-3 tracking-[-0.4px]">
          스토케 트립트랩
        </span>
      </div>
      <div className="flex w-full h-4.5 px-2.5 justify-between items-center shrink-0">
        <div className="flex w-8 h-4 px-2 justify-center items-center gap-2.5 shrink-0">
          <span className="text-center text-sm font-bold leading-3.5 tracking-[-0.4px] text-accent">
            42%
          </span>
        </div>
        <div className="flex w-14.5 h-4 justify-center items-center gap-2.5 shrink-0">
          <span className="text-sm font-bold leading-3.5 tracking-[-0.4px]">
            22,000
          </span>
        </div>
      </div>
    </div>
  );
}
