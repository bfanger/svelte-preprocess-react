# Migration to 3.0

`sveltify()` now only accepts a mapping:

```svelte
<script lang="ts">
  const react = sveltify({ MyReactComponent }); // ✅ syntax for 2.x and 3.x
</script>

<react.MyReactComponent />
```

```svelte
<script lang="ts">
  const Converted = sveltify(MyReactComponent); // ❌ old syntax no longer works
</script>

<Converted />
```
