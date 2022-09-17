# Architecture

This document describes designdecisions and implementation details of the preprocessor.

**Principles:**

- Compatibility first, Ease-of-use second and Performance last.

## Context

```jsx
<App>
  <react:ReduxProvider value={store}>
    <Layout>
      <react:Info />
    </Layout>
  </react:ReduxProvider>
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
<react:ReduxProvider value={store}>
  <react:Info />
</react:ReduxProvider>
```

### Client mode

sveltifyReact creates a single React Root and based on the Hierachy of the ReactWrapper components we're able to built the React tree:

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

This is why the childeren prop passed to your React is an array, even when you manually pass a children prop.
This array allows svelte-preprocess-react to inject the slotted content into the correct place in the React tree.

### Server mode

Based off on how the Svelte component is compiled we can detect SSR and utitilize the renderToString method th generate the html. (limited to leaf nodes a.t.m.)

This detection is done at runtime, so the client will also ship with the renderToStringYou server code.
For smaller bundle size you can disable this feature by passing `ssr: false` to the preprocess function.
