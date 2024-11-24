export default function portalTag(
  framework: "svelte" | "react",
  section: "portal" | "children" | `slot${number}`,
  direction: "target" | "source",
  nodeKey: string,
): string {
  return `${framework}-${section}${nodeKey.replace(/\//g, "-")}${direction}`;
}
