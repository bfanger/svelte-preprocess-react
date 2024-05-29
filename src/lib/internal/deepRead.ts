let cyclic: Set<unknown>;
/**
 * Access every property of an object, including nested objects.
 * When used in an $effect block, it will rerun the effect whenever any property changes.
 */
export default function deepRead(object: unknown) {
  cyclic = new Set();
  rawDeepRead(object);
  cyclic = undefined as any;
}

function rawDeepRead(object: any) {
  if (cyclic.has(object)) {
    return;
  }
  cyclic.add(object);
  // eslint-disable-next-line guard-for-in
  for (const key in object) {
    const value = (object as any)[key];
    if (typeof value === "object" && value !== null) {
      rawDeepRead(value);
    }
  }
}
