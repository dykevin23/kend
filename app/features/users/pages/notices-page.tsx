import { CircleHelp } from "lucide-react";
import Content from "~/common/components/content";

export default function NoticesPage() {
  return (
    <Content headerPorps={{ title: "공지사항 및 FAQ", useRight: false }}>
      <div className="flex flex-col items-center justify-center w-full py-20 px-4 gap-3">
        <CircleHelp className="w-12 h-12 text-muted/40" />
        <span className="text-base font-medium text-muted">
          등록된 공지사항이 없습니다
        </span>
        <span className="text-sm text-muted/60 text-center leading-5">
          새로운 공지사항과 FAQ가 등록되면
          <br />
          이곳에서 확인하실 수 있습니다.
        </span>
      </div>
    </Content>
  );
}
