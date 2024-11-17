export default function portalTag(
  framework: "svelte" | "react",
  section: "portal" | "children",
  direction: "target" | "source",
  nodeKey: string,
): string {
  return `${framework}-${section}${nodeKey.replace(/\//g, "-")}${direction}`;
}
