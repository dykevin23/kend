import CompanyFooter from "~/common/components/company-footer";

// kend-native EAS preview 빌드 (2026-09-01). EAS 빌드 아티팩트 URL은 일정 기간 후 만료될 수 있음 — 재빌드 시 갱신 필요
const ANDROID_APK_URL =
  "https://expo.dev/artifacts/eas/OeMaWgXWkvcZTor6UpSI8VD2TsCo3Udme3EpIRIOauI.apk";

export default function IntroPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-col items-center gap-1 pt-16 pb-10 px-6">
        <span className="text-center font-arimo text-[48px] font-bold italic leading-[100%] text-secondary">
          KEND
        </span>
        <span className="text-center font-arimo text-sm italic font-bold leading-[18px] text-secondary">
          Kids are an ENDuser
        </span>
      </div>

      <div className="flex flex-col items-center gap-2 px-6 pb-10 text-center">
        <p className="text-base leading-6 text-gray-900">
          자녀의 성장정보를 기반으로 꼭 맞는 유아용품을 추천하고
          <br />
          구매까지 이어주는 커머스 서비스입니다.
        </p>
      </div>

      <div className="flex flex-col gap-4 px-6 pb-10 max-w-sm mx-auto w-full">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-900">자녀 성장정보 기반 맞춤 추천</span>
          <span className="text-sm text-muted leading-5">연령·월령·사이즈 등 자녀 프로필에 맞는 유아용품을 추천합니다.</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-900">유아용품 커머스</span>
          <span className="text-sm text-muted leading-5">여러 판매자가 입점한 상품을 한 곳에서 검색하고 구매할 수 있습니다.</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-900">안전한 반품·교환 정책</span>
          <span className="text-sm text-muted leading-5">전자상거래법 기준에 따른 공통 반품·환불 정책을 운영합니다.</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-900">문의하기 지원</span>
          <span className="text-sm text-muted leading-5">주문·상품 관련 문의를 앱 내에서 바로 남기고 답변받을 수 있습니다.</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 px-6 pb-16">
        {ANDROID_APK_URL ? (
          <a
            href={ANDROID_APK_URL}
            className="w-full max-w-xs py-3 rounded-lg bg-secondary text-white text-center font-medium"
          >
            안드로이드 테스트 버전 다운로드 (APK)
          </a>
        ) : (
          <span className="text-sm text-muted">앱 다운로드 링크 준비 중입니다.</span>
        )}
        <span className="text-xs text-muted text-center leading-5">
          현재 정식 출시 전 단계입니다. iOS는 별도 심사가 진행 중이며 출시를 준비하고 있습니다.
        </span>
      </div>

      <div className="mt-auto">
        <CompanyFooter />
      </div>
    </div>
  );
}
