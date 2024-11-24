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

In React, children can be any type and can be inspected, modified or used in way.

Svelte/React input:

```svelte
<react.p>
  <h1>Content</h1>
</react.p>
```

React vDOM output:

```jsx
<Bridge>
  <SvelteToReactContext.Provider>
    <p>
      <Bridge>
        <SvelteToReactContext.Provider>
          <Child /> <- When merging the render trees the <h1>Content</h1> is injected here
        </SvelteToReactContext.Provider>
      </Bridge>
    </p>
  </SvelteToReactContext.Provider>
</Bridge>
```

HTML output:

```html
<svelte-portal-x-target style="display: contents;">
  <p>
    <react-children-x-target style="display: contents;">
      <svelte-children-x-source style="display: contents;">
        <h1>Content</h1>
      </svelte-children-x-source>
    </react-children-x-target>
  </p>
</svelte-portal-x-target>
```

There are cases where the React virtual DOM or this real DOM can cause problems.
A workaround is write a react wrapper component that create the wanted structure and use that component inside Svelte.

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

## Synchronous rendering

We render 2 trees, one for Svelte and one for React and then merge their output.

Because the Svelte server rendering synchronous, we must also use the synchronous api in React.
Therefor we use the renderToString instead of the newer renderToPipeableStream api.
