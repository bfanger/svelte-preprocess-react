import { createContext } from "react";
import type { getAllContexts, Snippet } from "svelte";

const ReactContext = createContext<
  | {
      suffix: string;
      context: ReturnType<typeof getAllContexts>;
      svelteChildren?: Snippet;
      reactChildren?: any;
    }
  | undefined
>(undefined);

export default ReactContext;
