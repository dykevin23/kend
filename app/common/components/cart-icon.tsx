import { ShoppingBag } from "lucide-react";
import { Link, useRouteLoaderData } from "react-router";
import { cn } from "~/lib/utils";

interface RootLoaderData {
  cartCount: number;
}

export default function CartIcon({ className }: { className?: string }) {
  const data = useRouteLoaderData("root") as RootLoaderData | undefined;
  const cartCount = data?.cartCount ?? 0;

  return (
    <Link
      to="/carts"
      prefetch="intent"
      aria-label="장바구니"
      className={cn(
        "relative flex size-[38px] items-center justify-center text-gray-900",
        className
      )}
    >
      <ShoppingBag className="size-[22px]" strokeWidth={1.8} />
      {cartCount > 0 && (
        <span className="absolute top-[5px] right-[3px] flex items-center justify-center min-w-[15px] h-[15px] px-1 text-[9px] font-extrabold text-white bg-accent rounded-full">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  );
}
