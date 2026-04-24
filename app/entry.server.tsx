import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";

export const streamTimeout = 5_000;

const NO_STORE_PREFIXES = ["/auth", "/payments"];
const NO_STORE_EXACT = new Set(["/children/submit"]);
const NO_STORE_REGEXES = [
  /^\/children\/[^/]+\/edit$/,
  /^\/children\/[^/]+\/growth$/,
];

function isNoStorePath(pathname: string): boolean {
  if (NO_STORE_EXACT.has(pathname)) return true;
  if (
    NO_STORE_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    )
  ) {
    return true;
  }
  return NO_STORE_REGEXES.some((r) => r.test(pathname));
}

function applyCacheControl(request: Request, headers: Headers) {
  if (headers.has("Cache-Control")) return;
  const url = new URL(request.url);
  headers.set(
    "Cache-Control",
    isNoStorePath(url.pathname) ? "no-store" : "private, max-age=60"
  );
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");

    let readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");
          applyCacheControl(request, responseHeaders);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        },
      }
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}
