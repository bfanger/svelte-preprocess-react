/* eslint-disable  @typescript-eslint/no-unused-vars */

/**
 * @deprecated
 * Stop using used() to silence linting & typescript errors, and add:
 * ```ts
 *   const react = sveltity({ MyComponent });
 * ```
 * and use the component as:
 * ```svelte
 *   <react.MyComponent />
 * ```
 * for improved type-safety & autocompletion.
 */
export default function used(...args: any[]) {}
