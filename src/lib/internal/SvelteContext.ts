import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { getContext, setContext } from "svelte";

export type ReactApp = {
  render(vdom: ReactNode): void;
  unmount(): void;
};

export type SvelteContext = {
  createApp: () => ReactApp;
};

export function getSvelteContext(): SvelteContext {
  const ctx = getContext<SvelteContext | undefined>(getSvelteContext);
  if (ctx) {
    return ctx;
  }
  return {
    createApp() {
      const rootEl = document.createElement("sveltify-csr-react-root");
      const reactRoot = createRoot(rootEl);
      document.body.appendChild(rootEl);

      return {
        render(vdom: ReactNode) {
          reactRoot.render(vdom);
        },
        unmount() {
          flushSync(() => {
            reactRoot.unmount();
          });
          document.body.removeChild(rootEl);
        },
      };
    },
  };
}

export function setSvelteContext(createApp: () => ReactApp) {
  return setContext<SvelteContext>(getSvelteContext, { createApp });
}
