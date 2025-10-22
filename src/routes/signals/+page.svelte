<script lang="ts">
  import { createElement } from "react";
  import useSignalExample, { user } from "./useUsername.svelte";

  function Display() {
    const name = useSignalExample();
    return createElement("h1", null, `Hello ${name}`);
  }
  const react = sveltify({ Display });
</script>

<react.Display />

<input bind:value={user.name} placeholder="Enter your name" />
