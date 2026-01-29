import {
  ChevronRight,
  Package,
  MessageSquare,
  Ticket,
  Coins,
  Star,
  Bell,
  CircleHelp,
  Headphones,
  FileText,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { Link, useLoaderData } from "react-router";
import Content from "~/common/components/content";
import { cn } from "~/lib/utils";
import { makeSSRClient } from "~/supa-client";
import { getUserOrderCount } from "~/features/orders/queries";
import type { Route } from "./+types/my-page";

/**
 * 빠른 메뉴 아이템 타입
 */
interface QuickMenuItem {
  icon: React.ReactNode;
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
    icon: React.ReactNode;
    label: string;
    href: string;
  }[];
}

/**
 * 빠른 메뉴 아이템 컴포넌트
 */
function QuickMenuCard({ icon, label, count, href }: QuickMenuItem) {
  return (
    <Link
      to={href}
      className="flex flex-col items-center justify-center gap-1 flex-1"
    >
      <div className="flex items-center justify-center w-10 h-10 text-gray-600">
        {icon}
      </div>
      <span className="text-xs text-gray-600">{label}</span>
      {count !== undefined && (
        <span className="text-sm font-semibold text-secondary">{count}</span>
      )}
    </Link>
  );
}

/**
 * 메뉴 리스트 아이템 컴포넌트
 */
function MenuItem({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="flex items-center justify-between py-3.5 px-4 hover:bg-gray-50 active:bg-gray-100"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500">{icon}</span>
        <span className="text-sm text-gray-900">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </Link>
  );
}

/**
 * 메뉴 그룹 컴포넌트
 */
function MenuSection({ title, items }: MenuGroup) {
  return (
    <div className="flex flex-col">
      <div className="px-4 py-2">
        <span className="text-xs text-gray-400 font-medium">{title}</span>
      </div>
      <div className="flex flex-col">
        {items.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            label={item.label}
            href={item.href}
          />
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
    return { orderCount: 0 };
  }

  const orderCount = await getUserOrderCount(client, user.id);

  return { orderCount };
};

export default function MyPage() {
  const { orderCount } = useLoaderData<typeof loader>();
  // TODO: 실제 사용자 데이터로 교체
  const user = {
    nickname: "KENDD",
    introduction: "채림이 지은이 딸랑구 맘입니다.",
    avatar: null as string | null,
  };

  // 빠른 메뉴 아이템 - 실제 컨텐츠는 추후 결정
  const quickMenuItems: QuickMenuItem[] = [
    {
      icon: <Package className="w-6 h-6" />,
      label: "주문/배송",
      count: orderCount,
      href: "/orders",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      label: "리뷰",
      count: 0,
      href: "/reviews",
    },
    {
      icon: <Ticket className="w-6 h-6" />,
      label: "쿠폰",
      count: 0,
      href: "/coupons",
    },
    {
      icon: <Coins className="w-6 h-6" />,
      label: "포인트",
      count: 0,
      href: "/points",
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: "마일리지",
      count: 0,
      href: "/mileage",
    },
  ];

  // 메뉴 그룹 - 실제 컨텐츠는 추후 결정
  const menuGroups: MenuGroup[] = [
    {
      title: "쇼핑",
      items: [
        {
          icon: <Package className="w-5 h-5" />,
          label: "최근 본 상품",
          href: "/recent-products",
        },
        {
          icon: <MapPin className="w-5 h-5" />,
          label: "배송지 관리",
          href: "/myPage/addresses",
        },
      ],
    },
    {
      title: "고객센터",
      items: [
        {
          icon: <Bell className="w-5 h-5" />,
          label: "알림 설정",
          href: "/settings/notifications",
        },
        {
          icon: <CircleHelp className="w-5 h-5" />,
          label: "공지사항 및 FAQ",
          href: "/notices",
        },
        {
          icon: <Headphones className="w-5 h-5" />,
          label: "고객지원",
          href: "/support",
        },
        {
          icon: <FileText className="w-5 h-5" />,
          label: "이용 약관",
          href: "/terms",
        },
        {
          icon: <ShieldCheck className="w-5 h-5" />,
          label: "개인정보 처리 방침",
          href: "/privacy",
        },
      ],
    },
  ];

  return (
    <Content headerPorps={{ title: "마이 페이지" }}>
      <div className="flex flex-col w-full">
        {/* 프로필 영역 */}
        <div className="flex flex-col items-center py-6 px-4">
          {/* 아바타 */}
          <div
            className={cn(
              "w-20 h-20 rounded-full overflow-hidden",
              "bg-gray-200 flex items-center justify-center"
            )}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-gray-400">
                {user.nickname.charAt(0)}
              </span>
            )}
          </div>

          {/* 닉네임 */}
          <h2 className="mt-3 text-lg font-semibold text-gray-900">
            {user.nickname}
          </h2>

          {/* 소개 */}
          {user.introduction && (
            <p className="mt-1 text-sm text-gray-500">{user.introduction}</p>
          )}

          {/* 프로필 수정 버튼 */}
          <Link
            to="/profile/edit"
            className={cn(
              "mt-4 w-full max-w-xs py-2.5 px-4",
              "border border-gray-300 rounded-full",
              "text-sm text-gray-700 text-center",
              "hover:bg-gray-50 active:bg-gray-100"
            )}
          >
            프로필 수정하기
          </Link>
        </div>

        {/* 빠른 메뉴 영역 */}
        <div className="bg-gray-100 py-5 px-4">
          <div className="flex items-start justify-between">
            {quickMenuItems.map((item, index) => (
              <QuickMenuCard
                key={index}
                icon={item.icon}
                label={item.label}
                count={item.count}
                href={item.href}
              />
            ))}
          </div>
        </div>

        {/* 메뉴 그룹 영역 */}
        <div className="flex flex-col divide-y divide-gray-100">
          {menuGroups.map((group, index) => (
            <MenuSection key={index} title={group.title} items={group.items} />
          ))}
        </div>
      </div>
    </Content>
  );
}
