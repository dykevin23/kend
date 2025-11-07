import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("common/pages/home-page.tsx"),
  ...prefix("stores", [
    index("features/stores/pages/stores-page.tsx"),
    route("/:storeId", "features/stores/pages/store-page.tsx"),
  ]),
  ...prefix("products", [
    route("/:productId", "features/products/pages/product-page.tsx"),
  ]),
  ...prefix("carts", [index("features/carts/pages/shopping-cart-page.tsx")]),
  ...prefix("auth", [
    route("/login", "features/auth/pages/login-page.tsx"),
    route("/join", "features/auth/pages/join-page.tsx"),
  ]),
] satisfies RouteConfig;
