import * as React from "react";
import type { TreeNode } from "./types";

/**
 * Context from a sveltified parent component.
 */
const SvelteFirstContext = React.createContext(
  undefined as TreeNode | undefined,
);
SvelteFirstContext.displayName = "SvelteFirstContext";
export default SvelteFirstContext;
