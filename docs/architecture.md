# Architecture

This document describes design-decisions and implementation details of the preprocessor.

**Principles:**

- Compatibility first, Ease-of-use second and Performance last.

## Context

```jsx
<App>
  <react.ReduxProvider value={store}>
    <Layout>
      <react.Info />
    </Layout>
  </react.ReduxProvider>
</App>
```

Both Svelte and React have component trees, for context to work in both, Svelte needs to act as if the tree is:

```jsx
<App>
  <Layout />
</App>
```

and React needs to act as if the tree is:

```jsx
<react.ReduxProvider value={store}>
  <react.Info />
</react.ReduxProvider>
```

### Client mode

`sveltify()` creates a single React Root and based on the Hierarchy of the ReactWrapper components we're able to built the React tree:

```jsx
<Bridge>
  <ReduxProvider value={store}>
    <Bridge>
      <Info />
    <Bridge>
  </ReduxProvider>
</Bridge>
```

The `<Bridge>`s use React Portals to render the components into the DOM of the ReactWrapper Svelte component.

This is why the children prop passed to your React component is an array, even when you manually pass a children prop.
This array allows svelte-preprocess-react to inject the slotted content into the correct place in the React tree.

### Server mode

Server detection is done at runtime, so the client will also ship with the renderToStringYou server code.
For smaller bundle size you can disable this feature by passing `ssr: false` to the preprocess function.

Svelte is rendered first, while building the vdom for React.
Using string based methods:
`<svelte-children-source>` from the Svelte is injected into the React's `<react-children-target>`
`<react-portal-source>` from the React is then injected into the Svelte's `<svelte-portal-target>`

This allows React to maintain it's component trees (needed for context)
Note: Components created with `reactify` have trouble preserving the Svelte context

# Wrappers elements

`<svelte-*>` are wrappers rendered by Svelte  
`<react-*>` are wrappers rendered by React
