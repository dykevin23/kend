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
  ...prefix("children", [
    layout("features/children/layouts/children-overview-layout.tsx", [
      index("features/children/pages/children-index-page.tsx"),
      route("/:childId", "features/children/pages/children-page.tsx"),
    ]),
    route("/submit", "features/children/pages/submit-child-page.tsx"),
    route("/:childId/edit", "features/children/pages/edit-child-page.tsx"),
    route("/:childId/growth", "features/children/pages/growth-detail-page.tsx"),
  ]),
  ...prefix("likes", [index("features/likes/pages/likes-page.tsx")]),
  ...prefix("carts", [index("features/carts/pages/shopping-cart-page.tsx")]),
  ...prefix("search", [index("features/search/pages/search-page.tsx")]),
  ...prefix("users", [
    route("/addresses", "features/users/pages/address-action.ts"),
  ]),
  ...prefix("myPage", [
    index("features/users/pages/my-page.tsx"),
    route("/addresses", "features/users/pages/addresses-page.tsx"),
    route("/profile/edit", "features/users/pages/edit-profile-page.tsx"),
    route("/recent-products", "features/users/pages/recent-products-page.tsx"),
    route("/notifications", "features/users/pages/notifications-page.tsx"),
    route("/notices", "features/users/pages/notices-page.tsx"),
    route("/support", "features/users/pages/support-page.tsx"),
    route("/terms", "features/users/pages/terms-page.tsx"),
    route("/privacy", "features/users/pages/privacy-page.tsx"),
  ]),
  ...prefix("orders", [
    index("features/orders/pages/orders-page.tsx"),
    route("/action", "features/orders/pages/order-action.ts"),
  ]),
  ...prefix("payments", [
    route("/success", "features/payments/pages/payment-success-page.tsx"),
    route("/fail", "features/payments/pages/payment-fail-page.tsx"),
  ]),
  route("/terms", "features/users/pages/terms-page.tsx"),
  route("/privacy", "features/users/pages/privacy-page.tsx"),
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
