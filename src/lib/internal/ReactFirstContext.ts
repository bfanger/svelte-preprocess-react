import * as React from "react";

/**
 * Context from a reactified parent component.
 */
const ReactFirstContext = React.createContext<
  | {
      /** Resolves, when the parent svelte component was mounted & contexts are extracted */
      promise: Promise<void>;
      contexts?: Map<any, any>;
    }
  | undefined
>(undefined);
ReactFirstContext.displayName = "ReactToReactContext";
export default ReactFirstContext;
