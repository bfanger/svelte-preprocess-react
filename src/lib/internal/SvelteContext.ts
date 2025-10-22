import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { getContext, setContext } from "svelte";

type SvelteContext = () => Root;

export function getSvelteContext(): SvelteContext {
  const ctx = getContext<SvelteContext | undefined>(getSvelteContext);
  if (ctx) {
    return ctx;
  }
  function createBranch(): Root {
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
  }
  return createBranch;
}

export function setSvelteContext(createBranch: () => Root) {
  return setContext<SvelteContext>(getSvelteContext, createBranch);
}
