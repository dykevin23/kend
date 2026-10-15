import { useState, useEffect } from "react";
import { ChevronRight, User } from "lucide-react";
import { Link, useLoaderData, useNavigate, useFetcher } from "react-router";
import CompanyFooter from "~/common/components/company-footer";
import { createClient } from "@supabase/supabase-js";
import Content from "~/common/components/content";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import { makeSSRClient, browserClient } from "~/supa-client";
import { actionErrorResponse } from "~/lib/error-handler";
import { getUserOrderCount } from "~/features/orders/queries";
import { getUserReviewCount } from "~/features/reviews/queries";
import { getUserProfile } from "../queries";
import { useAlert } from "~/hooks/useAlert";
import type { Route } from "./+types/my-page";

/**
 * 통계(빠른 메뉴) 아이템 타입
 */
interface QuickMenuItem {
  label: string;
  count?: number;
  href: string;
}

/**
 * 메뉴 그룹 타입
 */
interface MenuGroup {
  title: string;
  items: {
    label: string;
    href: string;
  }[];
}

/**
 * 통계 카드의 한 칸 — 숫자 + 라벨
 */
function QuickMenuCard({ label, count, href }: QuickMenuItem) {
  return (
    <Link
      to={href}
      className="flex flex-1 flex-col items-center gap-1 py-4"
    >
      <span className="text-[17px] font-extrabold text-gray-900">
        {count ?? 0}
      </span>
      <span className="text-xs text-gray-500">{label}</span>
    </Link>
  );
}

/**
 * 메뉴 그룹 — 섹션 라벨 + 흰 카드 안의 구분선 행
 */
function MenuSection({ title, items }: MenuGroup) {
  return (
    <div className="flex flex-col">
      <span className="mb-1.5 text-xs font-extrabold tracking-[0.4px] text-gray-500">
        {title}
      </span>
      <div className="flex flex-col px-4 py-1 bg-white rounded-card shadow-card-sm divide-y divide-gray-100">
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className="flex items-center gap-3 px-1 py-3.5"
          >
            <span className="flex-1 text-sm font-semibold text-gray-900">
              {item.label}
            </span>
            <ChevronRight className="size-4 text-gray-400" strokeWidth={2.2} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { profile: null, orderCount: 0, reviewCount: 0, storageImageUrl: null };
  }

  try {
    const [profile, orderCount, reviewCount] = await Promise.all([
      getUserProfile(client, user.id),
      getUserOrderCount(client, user.id),
      getUserReviewCount(client, user.id),
    ]);

    const storageImageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/profiles/${user.id}`;

    return { profile, orderCount, reviewCount, storageImageUrl };
  } catch (error) {
    console.error("Failed to load my page data:", error);
    return { profile: null, orderCount: 0, reviewCount: 0, storageImageUrl: null };
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "deleteAccount") {
    try {
      // service_role 클라이언트로 사용자 삭제 (cascade로 하위 데이터 자동 삭제)
      const adminClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { error } = await adminClient.auth.admin.deleteUser(user.id);
      if (error) throw error;

      return { success: true };
    } catch (error) {
      return actionErrorResponse(error);
    }
  }

  return { success: false, error: "잘못된 요청입니다." };
};

export default function MyPage() {
  const { profile, orderCount, reviewCount, storageImageUrl } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { confirm } = useAlert();

  // 회원탈퇴 성공 시 로그인 페이지로 이동
  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === "idle") {
      browserClient.auth.signOut();
      navigate("/auth/login", { replace: true });
    }
  }, [fetcher.data, fetcher.state, navigate]);

  const handleDeleteAccount = () => {
    confirm({
      title: "회원 탈퇴",
      message: "정말 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.",
      primaryButton: {
        label: "탈퇴하기",
        onClick: () => {
          fetcher.submit(
            { intent: "deleteAccount" },
            { method: "post" }
          );
        },
      },
      secondaryButton: {
        label: "취소",
        onClick: () => {},
      },
    });
  };

  const handleLogout = async () => {
    await browserClient.auth.signOut();
    navigate("/auth/login");
  };

  // 클라이언트에서만 이미지 로드 시도
  useEffect(() => {
    if (storageImageUrl) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(storageImageUrl);
        setImageLoaded(true);
      };
      img.onerror = () => {
        // Storage 이미지 실패 시 소셜 아바타 시도
        if (profile?.avatar) {
          const socialImg = new Image();
          socialImg.onload = () => {
            setImageSrc(profile.avatar);
            setImageLoaded(true);
          };
          socialImg.onerror = () => {
            setImageSrc(null);
            setImageLoaded(true);
          };
          socialImg.src = profile.avatar;
        } else {
          setImageSrc(null);
          setImageLoaded(true);
        }
      };
      img.src = storageImageUrl;
    } else {
      setImageLoaded(true);
    }
  }, [storageImageUrl, profile?.avatar]);

  // 빠른 메뉴 아이템 - 실제 컨텐츠는 추후 결정
  const quickMenuItems: QuickMenuItem[] = [
    {
      label: "주문내역",
      count: orderCount,
      href: "/orders",
    },
    {
      label: "내 리뷰",
      count: reviewCount,
      href: "/myPage/reviews",
    },
  ];

  // 메뉴 그룹 - 실제 컨텐츠는 추후 결정
  const menuGroups: MenuGroup[] = [
    {
      title: "쇼핑",
      items: [
        {
          label: "최근 본 상품",
          href: "/myPage/recent-products",
        },
        {
          label: "배송지 관리",
          href: "/myPage/addresses",
        },
      ],
    },
    {
      title: "고객센터",
      items: [
        {
          label: "알림 설정",
          href: "/myPage/notifications",
        },
        {
          label: "공지사항 및 FAQ",
          href: "/myPage/notices",
        },
        {
          label: "문의 내역",
          href: "/myPage/inquiries",
        },
        {
          label: "고객지원",
          href: "/myPage/support",
        },
        {
          label: "이용 약관",
          href: "/myPage/terms",
        },
        {
          label: "개인정보 처리 방침",
          href: "/myPage/privacy",
        },
        {
          label: "교환·반품·환불 정책",
          href: "/myPage/refund-policy",
        },
      ],
    },
  ];

  return (
    <Content headerPorps={{ title: "마이페이지" }} className="bg-gray-50">
      <div className="flex flex-col w-full gap-5 px-5 pt-3 pb-20">
        {/* 프로필 카드 */}
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-3.5 p-5 bg-white rounded-card shadow-card-sm">
            <div className="flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-100">
              {imageSrc ? (
                <img src={imageSrc} alt="" className="size-full object-cover" />
              ) : (
                <User className="size-7 text-navy-500" />
              )}
            </div>
            <div className="flex flex-1 min-w-0 flex-col gap-1">
              <span className="text-[16.5px] font-extrabold text-gray-900 truncate">
                {profile?.nickname ?? "게스트"} 님
              </span>
              {profile?.introduction && (
                <span className="text-[12.5px] text-gray-500 truncate">
                  {profile.introduction}
                </span>
              )}
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-[34px] px-3.5 text-xs"
            >
              <Link to="/myPage/profile/edit">프로필 수정</Link>
            </Button>
          </div>

          {/* 통계 카드 */}
          <div className="flex bg-white rounded-card shadow-card-sm divide-x divide-gray-200 [&>*]:my-3.5 [&>*]:py-0.5">
            {quickMenuItems.map((item, index) => (
              <QuickMenuCard
                key={index}
                label={item.label}
                count={item.count}
                href={item.href}
              />
            ))}
          </div>
        </div>

        {/* 메뉴 그룹 */}
        {menuGroups.map((group, index) => (
          <MenuSection key={index} title={group.title} items={group.items} />
        ))}

        {/* 로그아웃 / 회원탈퇴 */}
        <div className="flex justify-center items-center gap-3.5">
          <button
            type="button"
            onClick={handleLogout}
            className="text-[12.5px] font-semibold text-gray-500"
          >
            로그아웃
          </button>
          <span className="text-gray-200">|</span>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={fetcher.state !== "idle"}
            className="text-[12.5px] font-semibold text-gray-400"
          >
            {fetcher.state !== "idle" ? "처리 중..." : "회원탈퇴"}
          </button>
        </div>
      </div>

      <CompanyFooter />
    </Content>
  );
}
