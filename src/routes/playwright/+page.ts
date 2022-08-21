/**
 * This page exposes variables on the window object that can be used by the Playwright tests.
 */

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const reactVersion = await (await fetch("/api/react-version.json")).json();
  const reactDomModule =
    reactVersion <= 17
      ? () => import("react-dom")
      : () => import("react-dom/client");
  return {
    reactVersion,
    ReactDOM: (await reactDomModule()).default,
  };
};
