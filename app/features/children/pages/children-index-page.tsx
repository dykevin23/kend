import { redirect } from "react-router";
import { makeSSRClient } from "~/supa-client";
import { getFirstChildCode } from "../queries";
import type { Route } from "./+types/children-index-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const firstChildCode = await getFirstChildCode(client, user.id);

  // 자녀가 있으면 첫 번째 자녀 페이지로 리다이렉트
  if (firstChildCode) {
    return redirect(`/children/${firstChildCode}`);
  }

  // 자녀가 없으면 레이아웃의 빈 상태 표시 (아무것도 반환하지 않음)
  return null;
};

// 레이아웃이 빈 상태를 처리하므로 이 컴포넌트는 렌더링되지 않음
export default function ChildrenIndexPage() {
  return null;
}
