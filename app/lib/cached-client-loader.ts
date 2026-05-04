import type { ClientLoaderFunctionArgs } from "react-router";

type CachedClientLoader<T> = ((
  args: ClientLoaderFunctionArgs
) => Promise<T>) & { hydrate?: boolean };

/**
 * iOS swipe back 등 POP 네비게이션 시 loader 재실행 방지를 위한 캐시.
 * React Router v7의 single fetch는 매 navigation마다 loader를 재실행하므로,
 * URL 단위로 직접 캐시한다.
 *
 * 주의: mutation 후 stale 데이터 노출 가능. 그 경우 별도 invalidation 필요.
 */
export function makeCachedClientLoader<T>(): CachedClientLoader<T> {
  const cache = new Map<string, T>();
  const fn: CachedClientLoader<T> = async ({ request, serverLoader }) => {
    const url = new URL(request.url);
    const key = url.pathname + url.search;
    if (cache.has(key)) return cache.get(key) as T;
    const data = (await serverLoader()) as T;
    cache.set(key, data);
    return data;
  };
  return fn;
}
