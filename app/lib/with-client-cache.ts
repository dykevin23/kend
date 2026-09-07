import type { ClientLoaderFunctionArgs } from "react-router";

type CachedClientLoader<T> = ((
  args: ClientLoaderFunctionArgs
) => Promise<T>) & { hydrate: true; invalidate: (key?: string) => void };

/**
 * iOS swipe back 등 POP 네비게이션 시 loader 재실행을 막기 위한 캐시된 clientLoader.
 *
 * 사용:
 *   export const loader = async ({ request }: Route.LoaderArgs) => { ... };
 *   export const clientLoader = makeCachedClientLoader<Awaited<ReturnType<typeof loader>>>();
 *
 * - URL(pathname + search) 단위로 클라이언트에 캐시
 * - 첫 hydration에도 적용 (hydrate = true 자동 설정)
 * - mutation 후에는 `clientLoader.invalidate(pathname + search)`(또는 인자 없이 전체 삭제) 호출 후
 *   `useRevalidator().revalidate()`로 재검증할 것 — 안 하면 캐시된 stale 데이터가 계속 보임
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
  fn.invalidate = (key?: string) => {
    if (key) cache.delete(key);
    else cache.clear();
  };
  return fn;
}
