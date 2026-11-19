import { Link, redirect } from "react-router";
import { Smartphone } from "lucide-react";
import type { Route } from "./+types/home-page";
import CompanyFooter from "~/common/components/company-footer";
import { isAppRequest } from "~/common/constants/app-client";
import { APP_STORE_URL } from "~/common/constants/app-links";
import { makeSSRClient } from "~/supa-client";

/**
 * 공개 홈페이지 (kend.co.kr) — readme/todo/web-access-policy.md
 * - 앱(WebView)·로그인 사용자 → 앱 첫 화면(/stores)
 * - 그 외(브라우저) → 서비스 소개 + 앱 다운로드 + 법적 문서 링크
 *   (Google OAuth 브랜딩 인증의 "홈페이지" 요건: 로그인 없이 열림, 앱 이름 표시, 개인정보처리방침 링크)
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  if (isAppRequest(request)) return redirect("/stores");
  const { client, headers } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (user) return redirect("/stores", { headers });
  return null;
};

export const meta: Route.MetaFunction = () => [
  { title: "KEND - 우리 아이 성장에 꼭 맞는 유아용품" },
  {
    name: "description",
    content:
      "KEND는 자녀의 성장정보를 기반으로 꼭 맞는 유아용품을 추천하고 구매까지 이어주는 커머스 앱입니다.",
  },
];

const FEATURES = [
  {
    title: "자녀 성장정보 기반 맞춤 추천",
    body: "연령·월령·사이즈 등 자녀 프로필에 맞는 유아용품을 추천합니다.",
  },
  {
    title: "유아용품 커머스",
    body: "여러 판매자가 입점한 상품을 한 곳에서 검색하고 구매할 수 있습니다.",
  },
  {
    title: "안전한 반품·교환 정책",
    body: "전자상거래법 기준에 따른 공통 반품·환불 정책을 운영합니다.",
  },
  {
    title: "문의하기 지원",
    body: "주문·상품 관련 문의를 앱 내에서 바로 남기고 답변받을 수 있습니다.",
  },
];

const LEGAL_LINKS = [
  { to: "/privacy", label: "개인정보처리방침", strong: true },
  { to: "/terms", label: "이용약관" },
  { to: "/refund-policy", label: "환불정책" },
  { to: "/support", label: "고객지원" },
];

export default function HomePage() {
  return (
    <div className="h-screen overflow-y-auto bg-white">
      <div className="flex flex-col min-h-full">
        <header className="w-full max-w-4xl mx-auto px-6 py-5">
          <span className="font-arimo text-2xl font-bold italic text-primary">KEND</span>
        </header>

        <section className="flex flex-col items-center text-center gap-4 px-6 pt-10 pb-12">
          <h1 className="font-arimo text-[48px] sm:text-[64px] font-bold italic leading-[100%] text-primary">
            KEND
          </h1>
          <span className="font-arimo text-sm italic font-bold text-primary">
            Kids are an ENDuser
          </span>
          <p className="text-base sm:text-lg leading-7 text-gray-900 mt-2">
            자녀의 성장정보를 기반으로 꼭 맞는 유아용품을 추천하고
            <br />
            구매까지 이어주는 커머스 서비스입니다.
          </p>

          <div className="flex flex-col items-center gap-2 mt-4">
            {APP_STORE_URL ? (
              <a
                href={APP_STORE_URL}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white font-medium"
              >
                <Smartphone className="w-5 h-5" />
                App Store에서 다운로드
              </a>
            ) : (
              <span className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-100 text-gray-500 font-medium">
                <Smartphone className="w-5 h-5" />
                App Store 출시 예정
              </span>
            )}
            <span className="text-xs text-muted">
              KEND는 모바일 앱으로 이용할 수 있습니다.
            </span>
          </div>
        </section>

        <section className="w-full max-w-4xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-1 p-5 rounded-xl bg-gray-50">
                <span className="text-sm font-bold text-gray-900">{f.title}</span>
                <span className="text-sm text-muted leading-5">{f.body}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-auto">
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-6 py-5 border-t border-gray-100 text-sm">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={l.strong ? "font-bold text-gray-900" : "text-muted"}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <CompanyFooter />
        </footer>
      </div>
    </div>
  );
}
