import * as React from "react";
import type { TreeNode } from "./types";

const SvelteToReactContext = React.createContext(
  undefined as TreeNode | undefined,
);
SvelteToReactContext.displayName = "SvelteToReactContext";
export default SvelteToReactContext;
