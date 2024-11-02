# Migration to 2.0

In the tag change the `:` double colon into a `.` dot, instead of:

`<react:MyComponent>` ❌ old

write:

`<react.MyComponent>` ✅ new

## Type safety

When using Typescript, in the `<script lang="ts">` section add:

```ts
const react = sveltify({ MyComponent });
```

If you want to use sveltify without importing it, in `src/app.d.ts` add:

```ts
/// <reference types="svelte-preprocess-react" />`
```

## ESLint

The preprocessor will autoimport sveltify and can also generate the react object based on usage of `<react.* />` tags.

So both `const react = sveltify({ MyComponent })` and the `import { sveltify } from "svelte-preprocess-react"` are optional, but that confuses ESLint.

To avoid the `no-undef` errors in your `eslint.config.js` add `sveltify: true, react: true` to your `globals`.
When using Typescript it's recommended to only add `sveltify: true`, then the eslint warnign acts as a reminder to add a `const react = sveltify({..})` for type-safety.

## Why the change?

In Svelte 5 the compiler gives a warning when using `<react:MyComponent />` syntax:

> Self-closing HTML tags for non-void elements are ambiguous — use `<react:MyComponent ...></react:MyComponent>` rather than `<react:MyComponent ... />`(element_invalid_self_closing_tag)

Easily solved by adding a closing tag, but it's a less elegant syntax.

Secondly, a huge benefit of the new rune-inspired syntax is that it's compatible with existing tooling.
