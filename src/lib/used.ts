/* eslint-disable  @typescript-eslint/no-unused-vars */

/**
 * This method does absolutely nothing, it's a no-op
 *
 * Svelte/TypeScript is not (yet) able to detect usage of the <react:ComponentX> syntax.
 * This causes `X is declared but its value is never read. (ts:6133)` errors.
 *
 * This function can be used to suppress these errors.
 *
 * Usage:
 *
 *   used(ComponentX, ComponentY);
 */
export default function used(...args: any[]) {}
