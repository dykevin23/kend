import { Link, redirect } from "react-router";
import type { Route } from "./+types/child-redirect-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { getChildren } from "../queries";
import { Button } from "~/common/components/ui/button";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const children = await getChildren(client, { userId });

  if (children.length > 0) {
    const [child] = children;
    return redirect(`/children/${child.child_id}`);
  }
};

export default function ChildRedirectPage() {
  return (
    <div>
      Empth Child
      <Button asChild>
        <Link to="./submit">아이추가하기</Link>
      </Button>
    </div>
  );
}
