import type { ReactNode } from "react";
import { getContext, setContext } from "svelte";

export type ReactApp = {
  render(vdom: ReactNode): void;
  unmount(): void;
};

export type SvelteContext = {
  createApp(): ReactApp;
};

export function getSvelteContext() {
  return getContext<SvelteContext | undefined>(getSvelteContext);
}

export function setSvelteContext(createApp: () => ReactApp) {
  return setContext<SvelteContext>(getSvelteContext, { createApp });
}
