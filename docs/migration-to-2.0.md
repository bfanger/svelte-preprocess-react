# Migration to 2.0

Change `<react:MyComponent>` into `<react.MyComponent>` (`:` to `.`).

When using Typescript, add:

```ts
const react = sveltify({ MyComponent });
```

in the `<script lang="ts">` section for type safety.

When getting ESLint no-undef errors:

in `eslint.config.js` add `sveltify: true` to your globals or add a `import { sveltify } from 'svelte-preprocess-react'`.

Also add `react: true` if you don't want  

## Why the change?

In Svelte 5 the compiler gives a warning when using `<react:MyComponent />` syntax:

> Self-closing HTML tags for non-void elements are ambiguous — use `<react:MyComponent ...></react:MyComponent>` rather than `<react:MyComponent ... />`(element_invalid_self_closing_tag)

Easily solved, but it a less elegant syntax.

Secondly, the new syntax allows for IDE support.

