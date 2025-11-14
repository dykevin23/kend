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
  ...prefix("likes", [index("features/likes/pages/likes-page.tsx")]),
  ...prefix("carts", [index("features/carts/pages/shopping-cart-page.tsx")]),
  ...prefix("search", [index("features/search/pages/search-page.tsx")]),
  ...prefix("auth", [
    route("/login", "features/auth/pages/login-page.tsx"),
    route("/join", "features/auth/pages/join-page.tsx"),
    ...prefix("/social/:provider", [
      route("/start", "features/auth/pages/social-start-page.tsx"),
      route("/complete", "features/auth/pages/social-complete-page.tsx"),
    ]),
    ...prefix("/naver", [
      route("/start", "features/auth/pages/naver-start-page.tsx"),
      route("/complete", "features/auth/pages/naver-complete-page.tsx"),
      route("/callback", "features/auth/pages/naver-callback-page.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
