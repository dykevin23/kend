import { CircleHelp } from "lucide-react";
import { DateTime } from "luxon";
import Content from "~/common/components/content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/common/components/ui/accordion";
import { makeSSRClient } from "~/supa-client";
import { getVisibleNotices } from "../queries";
import type { Route } from "./+types/notices-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const notices = await getVisibleNotices(client);

  return { notices };
};

export default function NoticesPage({ loaderData }: Route.ComponentProps) {
  const { notices } = loaderData;

  return (
    <Content headerPorps={{ title: "공지사항", useRight: false }}>
      {notices.length > 0 ? (
        <Accordion type="single" collapsible className="w-full px-4">
          {notices.map((notice) => (
            <AccordionItem key={notice.id} value={notice.id}>
              <AccordionTrigger>
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-sm font-medium">{notice.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {DateTime.fromISO(notice.created_at).toFormat("yyyy.M.d")}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {notice.content}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center w-full py-20 px-4 gap-3">
          <CircleHelp className="w-12 h-12 text-muted/40" />
          <span className="text-base font-medium text-muted">
            등록된 공지사항이 없습니다
          </span>
          <span className="text-sm text-muted/60 text-center leading-5">
            새로운 공지사항이 등록되면
            <br />
            이곳에서 확인하실 수 있습니다.
          </span>
        </div>
      )}
    </Content>
  );
}
