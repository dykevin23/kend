import { redirect } from "react-router";
import type { Route } from "./+types/children-redirect-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  //   const { client } = makeSSRClient(request);
  //   const userId = await getLoggedInUserId(client);
  //   const children = await getChildren(client, { userId });

  //   if (children.length > 0) {
  //     const [child] = children;
  //     return redirect(`/children/${child.child_id}`);
  //   }
  return redirect(`/children/1`);
};
