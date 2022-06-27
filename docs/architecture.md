## Context

### Goals

- Multi layer (a react context should go through a svelte componten layer into the nested react component)
- SSR compatible

```jsx
<App>
  <react:ReduxProvider value={store}>
    <Layout>
      <react:Info />
    </Layout>
  </react:ReduxProvider>
</App>
```

Both svelte and react have component trees, for context to work in both svelte needs to think the tree is

```jsx
<App>
  <Layout />
</App>
```

and react needs to think the tree is

```jsx
<react:ReduxProvider value={store}>
  <react:Info />
</react:ReduxProvider>
```

### Client mode

Creates the react tree using `<Bridge>`s and uses react portals to render the components into the DOM of the ReactWrapper svelte component.

```jsx
<Bridge>
  <ReduxProvider value={store}>
    <Bridge>
      <Info />
    <Bridge>
  </ReduxProvider>
</Bridge>
```

### Server mode
