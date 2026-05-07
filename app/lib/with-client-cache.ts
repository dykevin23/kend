import type { ClientLoaderFunctionArgs } from "react-router";

type CachedClientLoader<T> = ((
  args: ClientLoaderFunctionArgs
) => Promise<T>) & { hydrate: true };

/**
 * iOS swipe back 등 POP 네비게이션 시 loader 재실행을 막기 위한 캐시된 clientLoader.
 *
 * 사용:
 *   export const loader = async ({ request }: Route.LoaderArgs) => { ... };
 *   export const clientLoader = makeCachedClientLoader<Awaited<ReturnType<typeof loader>>>();
 *
 * - URL(pathname + search) 단위로 클라이언트에 캐시
 * - 첫 hydration에도 적용 (hydrate = true 자동 설정)
 * - 주의: mutation 후 stale 데이터 위험. 필요하면 별도 invalidation 추가.
 *
 * destructure export(`export const { loader, clientLoader } = ...`)는
 * React Router framework mode에서 막혀있어 별도 함수로 제공.
 */
export function makeCachedClientLoader<T>(): CachedClientLoader<T> {
  const cache = new Map<string, T>();
  const fn = (async ({
    request,
    serverLoader,
  }: ClientLoaderFunctionArgs) => {
    const url = new URL(request.url);
    const key = url.pathname + url.search;
    if (cache.has(key)) return cache.get(key) as T;
    const data = (await serverLoader()) as T;
    cache.set(key, data);
    return data;
  }) as CachedClientLoader<T>;
  fn.hydrate = true;
  return fn;
}
