import type { To } from "../types";

/**
 * Convert a react-router location to an URL.
 */
export default function locationToUrl(to: To, base?: URL): URL {
  const pathname = typeof to === "string" ? to : to.pathname;
  let url: URL;
  const baseUrl = new URL(
    base ??
      (typeof window === "undefined"
        ? "http://localhost"
        : window.location.href),
  );

  if (typeof to === "string" && /^[a-z]+:\/\//.test(to)) {
    // Absolute URL incl domain
    url = new URL(to, baseUrl);
  } else if (pathname === ".") {
    // react-router uses "." to represent the current location
    url = new URL(baseUrl);
  } else if (pathname.startsWith("/")) {
    // Absolute path (same domain)
    url = new URL(pathname, baseUrl);
  } else if (pathname === "..") {
    baseUrl.pathname += "/";
    url = new URL(pathname, baseUrl);
    url.pathname = url.pathname.substring(0, url.pathname.length - 1);
  } else {
    // relative path
    url = new URL(pathname, baseUrl);
  }
  if (typeof to === "object") {
    url.search = to.search;
    url.hash = to.hash;
  }
  if (url.origin === baseUrl.origin) {
    url.toString = function toString() {
      // Strip the origin from the URL
      return URL.prototype.toString.call(url).substring(this.origin.length);
    };
  }
  return url;
}
