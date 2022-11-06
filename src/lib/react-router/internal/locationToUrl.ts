import type { To } from "../types";

/**
 * Convert a react-router location to an URL.
 */
export default function locationToUrl(to: To, base = "http://localhost/"): URL {
  const pathname = typeof to === "string" ? to : to.pathname;
  let url: URL;
  if (typeof to === "string" && /^[a-z]+:\/\//.test(to)) {
    // Absolute URL incl domain
    return new URL(to, base);
  }
  if (pathname === ".") {
    // react-router uses "." to represent the current location
    url = new URL(base);
  } else if (pathname.startsWith("/")) {
    // Absolute path (same domain)
    url = new URL(pathname, base);
  } else {
    // react-router's relative path
    url = new URL(pathname, base?.endsWith("/") ? base : `${base}/`);
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      // Remove trailing slash
      url.pathname = url.pathname.substring(0, url.pathname.length - 1);
    }
  }
  if (typeof to === "object") {
    url.search = to.search;
    url.hash = to.hash;
  }
  url.toString = function toString() {
    // Strip the origin from the URL
    return URL.prototype.toString.call(url).substring(this.origin.length);
  };
  return url;
}
