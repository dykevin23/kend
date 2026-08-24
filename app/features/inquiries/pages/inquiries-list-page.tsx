import { Link, redirect, useLoaderData } from "react-router";
import { DateTime } from "luxon";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { makeSSRClient } from "~/supa-client";
import { getUserInquiries } from "../queries";
import { INQUIRY_CATEGORY_LABELS, getInquiryStatusLabel } from "../utils";
import type { Route } from "./+types/inquiries-list-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw redirect("/auth/login");
  }

  const inquiries = await getUserInquiries(client, user.id);

  return { inquiries };
};

export default function InquiriesListPage() {
  const { inquiries } = useLoaderData<typeof loader>();

  return (
    <Content headerPorps={{ title: "문의 내역", useRight: false }}>
      <div className="flex flex-col w-full bg-gray-50 min-h-full">
        <div className="px-4 py-3 bg-white border-b border-gray-100">
          <Button className="w-full" asChild>
            <Link to="/myPage/inquiries/new">문의하기</Link>
          </Button>
        </div>

        {inquiries.length > 0 ? (
          <div className="flex flex-col">
            {inquiries.map((inquiry) => {
              const status = getInquiryStatusLabel(inquiry.status);
              return (
                <Link
                  key={inquiry.id}
                  to={`/myPage/inquiries/${inquiry.id}`}
                  className="flex flex-col gap-1.5 px-4 py-4 bg-white border-b border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {INQUIRY_CATEGORY_LABELS[inquiry.category]}
                    </span>
                    <span className={`text-xs font-bold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">
                    {inquiry.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {DateTime.fromISO(inquiry.createdAt).toFormat("yyyy.M.d")}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white">
            <span className="text-sm">문의 내역이 없습니다.</span>
          </div>
        )}
      </div>
    </Content>
  );
}
