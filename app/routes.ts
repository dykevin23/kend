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
    route("/likes", "features/products/pages/like-products-page.tsx"),
  ]),
  route("/children", "features/children/pages/child-page.tsx"),
  ...prefix("chats", [
    index("features/chats/pages/chats-page.tsx"),
    route("/:chatId", "features/chats/pages/chat-page.tsx"),
  ]),
  ...prefix("/profile", [
    index("features/profile/pages/mypage-page.tsx"),
    route("/modify", "features/profile/pages/modify-profile-page.tsx"),
    route("/:userId", "features/profile/pages/user-page.tsx"),
  ]),
  ...prefix("/auth", [
    route("/login", "features/auth/pages/login-page.tsx"),
    route("/join", "features/auth/pages/join-page.tsx"),
  ]),
] satisfies RouteConfig;
