import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { browserClient } from "~/supa-client";

/**
 * Supabase Auth 상태 변경을 감지하여 세션 만료 시 로그인 페이지로 이동한다.
 *
 * - SIGNED_OUT: 세션 만료 또는 명시적 로그아웃 → /auth/login으로 이동
 * - TOKEN_REFRESHED: 정상 갱신 (별도 처리 없음)
 *
 * root.tsx의 App 컴포넌트에서 호출한다.
 */
export function useAuthListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    const {
      data: { subscription },
    } = browserClient.auth.onAuthStateChange((event) => {
      // auth 페이지에서는 리스너 무시 (로그인/회원가입 중)
      if (locationRef.current.pathname.startsWith("/auth")) {
        return;
      }

      if (event === "SIGNED_OUT") {
        navigate("/auth/login", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);
}
