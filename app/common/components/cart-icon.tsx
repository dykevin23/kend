import { ShoppingBag } from "lucide-react";
import { Link, useRouteLoaderData } from "react-router";

interface RootLoaderData {
  cartCount: number;
}

export default function CartIcon() {
  const data = useRouteLoaderData("root") as RootLoaderData | undefined;
  const cartCount = data?.cartCount ?? 0;

  return (
    <Link to="/carts" prefetch="intent" className="relative">
      <ShoppingBag className="size-7" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-xs font-bold text-white bg-accent rounded-full">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  );
}
