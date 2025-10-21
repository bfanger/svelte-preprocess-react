# Caveats

We try to maximize compatibility between React & Svelte.
However, there are some inherent limitations to be aware of.

## Binding

React components are one directional by design, therefor you can't two-way bind to a prop:

```svelte
<react.input bind:value />
❌
```

Listen to events instead:

```svelte
<react.input
  {value}
  onInput={(e) => {
    value = e.currentTarget.value;
  }}
/>
✅
```

## No JSX

JSX is not supported inside \*.svelte files:

```svelte
<react.MenuItem
  icon={<react.Icon icon="book" />}
  label="Books"
/>
❌
```

Use the non-jsx syntax:

```svelte
<script>
  import { createElement } from "react";
</script>

<react.MenuItem icon={createElement(Icon, { icon: "book" })} label="Books" />
✅
```

## Children incompatibility

React children and Svelte children are fundamentally different.

In Svelte children are a `Snippet` or `undefined`. You can't do much besides ` {@render children?.()}`.
This improved encapsulation and predictability, but is less flexible than React.

In React, children can be any type and can be inspected, modified or used in multiple ways.

Svelte/React input:

```svelte
<react.p>
  <span>Content</span>
</react.p>
```

React vDOM output:

```jsx
<ReactContext>
    <p>
        <SveltifiedChild>
          <sveltified-csr-react-child /> <- When merging the render trees the <span>Content</span> is injected into this element
        </SveltifiedChild>
    </p>
</ReactContext>
```

HTML output:

```html
<sveltify-csr-portal>
  <p>
    <sveltify-csr-react-child>
      <sveltify-csr-children>
        <span>Content</span>
      </sveltify-csr-children>
    </sveltify-csr-react-child>
  </p>
</sveltify-csr-portal>
```

There are cases where the React virtual DOM or this real DOM can cause problems.
The workaround is to write a react component that creates the wanted structure and use that component inside Svelte.

### Render props

```svelte
<react.SearchResults>{async (query) => fetchResults(query))}</react.SearchResults>
❌
```

Use the `children` prop instead:

```svelte
<react.SearchResults children={ async (query) => fetchResults(query)) } />
✅
```

## Asynchronous rendering

We render 2 trees, one for Svelte and one for React and then interleave their output.
This requires both renderers to be asynchronous and wait on each other.
