import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("common/pages/home-page.tsx"),
  ...prefix("products", [
    index("features/products/pages/product-page.tsx"),
    route("/submit", "features/products/pages/submit-page.tsx"),
  ]),
  route("/children", "features/children/pages/child-page.tsx"),
  route("/chats", "features/chats/pages/chat-page.tsx"),
  route("/mypage", "features/mypage/pages/mypage-page.tsx"),
] satisfies RouteConfig;
