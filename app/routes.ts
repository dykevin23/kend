import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("common/pages/home-page.tsx"),
  route("/products", "features/products/pages/product-page.tsx"),
  route("/children", "features/children/pages/child-page.tsx"),
  route("/chats", "features/chats/pages/chat-page.tsx"),
  route("/mypage", "features/mypage/pages/mypage-page.tsx"),
] satisfies RouteConfig;
