import type { ClientLoaderFunctionArgs } from "react-router";

type CachedClientLoader<TData> = ((
  args: ClientLoaderFunctionArgs
) => Promise<TData>) & { hydrate: true };

/**
 * iOS swipe back 등 POP 네비게이션 시 loader 재실행을 막기 위한 캐시 래퍼.
 *
 * 사용:
 *   export const { loader, clientLoader } = withClientCache(
 *     async ({ request }: Route.LoaderArgs) => { ... }
 *   );
 *
 * - URL(pathname + search) 단위로 클라이언트에 캐시
 * - 첫 hydration에도 적용 (clientLoader.hydrate = true)
 * - 주의: mutation 후 stale 데이터 위험. 필요하면 별도 invalidation 추가.
 */
export function withClientCache<TArgs, TData>(
  loader: (args: TArgs) => Promise<TData>
): {
  loader: (args: TArgs) => Promise<TData>;
  clientLoader: CachedClientLoader<TData>;
} {
  const cache = new Map<string, TData>();

  const clientLoader = async ({
    request,
    serverLoader,
  }: ClientLoaderFunctionArgs) => {
    const url = new URL(request.url);
    const key = url.pathname + url.search;
    if (cache.has(key)) return cache.get(key) as TData;
    const data = (await serverLoader()) as TData;
    cache.set(key, data);
    return data;
  };
  (clientLoader as { hydrate?: boolean }).hydrate = true;

  return {
    loader,
    clientLoader: clientLoader as CachedClientLoader<TData>,
  };
}
