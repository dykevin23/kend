import { Mail, Clock } from "lucide-react";
import Content from "~/common/components/content";

const SUPPORT_EMAIL = "support@kend.app";
const BUSINESS_HOURS = "평일 10:00 - 18:00 (주말 및 공휴일 제외)";

export default function SupportPage() {
  return (
    <Content headerPorps={{ title: "고객지원", useRight: false }}>
      <div className="flex flex-col w-full px-4 py-6 gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold leading-6">
            무엇을 도와드릴까요?
          </span>
          <span className="text-sm text-muted leading-5">
            이용 중 불편한 점이나 문의사항이 있으시면
            <br />
            아래 이메일로 연락해주세요.
          </span>
        </div>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-3 py-4 px-4 rounded-lg border border-muted/20 active:bg-muted/5"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10">
            <Mail className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-xs text-muted">이메일 문의</span>
            <span className="text-sm font-medium">{SUPPORT_EMAIL}</span>
          </div>
        </a>

        <div className="flex items-center gap-3 py-4 px-4 rounded-lg bg-muted/5">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/10">
            <Clock className="w-5 h-5 text-muted" />
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-xs text-muted">운영 시간</span>
            <span className="text-sm font-medium">{BUSINESS_HOURS}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 pt-2">
          <span className="text-xs text-muted/60 leading-4">
            *문의하신 내용은 영업일 기준 1-2일 이내에 답변드립니다.
          </span>
        </div>
      </div>
    </Content>
  );
}
