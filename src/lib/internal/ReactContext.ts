import { createContext } from "react";
import type { getAllContexts } from "svelte";

const ReactContext = createContext<
  | {
      /** suffix that will be added to the rendered tags for identification */
      suffix: string;
      /** Svelte context for mount or render */
      context: ReturnType<typeof getAllContexts>;
    }
  | undefined
>(undefined);

export default ReactContext;
