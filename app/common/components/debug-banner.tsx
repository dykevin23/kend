import { useEffect, useState } from "react";
import { useLocation } from "react-router";

type BfcacheState = "unknown" | "hit" | "miss";

const LAST_HIDE_KEY = "kend-debug-last-pagehide";

/**
 * 임시 디버그 배너 — bfcache 동작 및 Cache-Control 헤더 확인용.
 * 확인 완료 후 root.tsx에서 import/렌더링 제거할 것.
 */
export default function DebugBanner() {
  const { pathname } = useLocation();
  const [bfcache, setBfcache] = useState<BfcacheState>("unknown");
  const [cacheControl, setCacheControl] = useState<string>("…");
  const [lastEventAt, setLastEventAt] = useState<string>("");
  const [navType, setNavType] = useState<string>("?");
  const [lastPagehide, setLastPagehide] = useState<string>("?");

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      setBfcache(e.persisted ? "hit" : "miss");
      setLastEventAt(new Date().toTimeString().slice(0, 8));
      const prev = sessionStorage.getItem(LAST_HIDE_KEY);
      if (prev) setLastPagehide(prev);
      const nav = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming | undefined;
      if (nav) setNavType(nav.type);
    };
    const onPageHide = (e: PageTransitionEvent) => {
      sessionStorage.setItem(LAST_HIDE_KEY, e.persisted ? "true" : "false");
    };
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  useEffect(() => {
    fetch(window.location.pathname, { method: "HEAD", cache: "no-store" })
      .then((r) => setCacheControl(r.headers.get("cache-control") || "(none)"))
      .catch(() => setCacheControl("(fetch failed)"));
  }, [pathname]);

  const bg =
    bfcache === "hit" ? "#16a34a" : bfcache === "miss" ? "#dc2626" : "#6b7280";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        fontSize: 10,
        lineHeight: 1.3,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        background: bg,
        color: "white",
        padding: "3px 6px",
        pointerEvents: "none",
      }}
    >
      <div>
        <strong>[{bfcache}]</strong> {pathname}
        {lastEventAt ? ` · ${lastEventAt}` : ""}
      </div>
      <div style={{ opacity: 0.9 }}>
        navType: {navType} · lastPagehide.persisted: {lastPagehide}
      </div>
      <div style={{ opacity: 0.85 }}>CC: {cacheControl}</div>
    </div>
  );
}
