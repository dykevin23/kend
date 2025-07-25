import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("common/pages/home-page.tsx"),
  ...prefix("products", [
    index("features/products/pages/products-page.tsx"),
    route("/submit", "features/products/pages/submit-page.tsx"),
    route("/:productId", "features/products/pages/product-page.tsx"),
    route("/:productId/like", "features/products/pages/like-product-page.tsx"),
    route(
      "/:productId/chat",
      "features/products/pages/create-product-chat-page.tsx"
    ),
    route("/likes", "features/products/pages/like-products-page.tsx"),
  ]),
  ...prefix("/children", [
    index("features/children/pages/child-redirect-page.tsx"),
    route("/:childId", "features/children/pages/child-page.tsx"),
    route("/submit", "features/children/pages/submit-child-page.tsx"),
  ]),
  ...prefix("chats", [
    index("features/chats/pages/chats-page.tsx"),
    route("/:chatId", "features/chats/pages/chat-page.tsx"),
  ]),
  ...prefix("/users", [
    index("features/users/pages/mypage-page.tsx"),
    route("/modify", "features/users/pages/modify-profile-page.tsx"),
    route("/:userId", "features/users/pages/user-page.tsx"),
  ]),
  ...prefix("/auth", [
    route("/login", "features/auth/pages/login-page.tsx"),
    route("/join", "features/auth/pages/join-page.tsx"),
    ...prefix("/social/:provider", [
      route("/start", "features/auth/pages/social-start-page.tsx"),
      route("/complete", "features/auth/pages/social-complete-page.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
