/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

/**
 * @deprecated
 * Stop using used() to silence linting & typescript errors, instead:
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
