<script lang="ts">
  import { useState } from "react";
  import { hooks, used } from "$lib";
  import ReactDOMClient from "react-dom/client"; // React 18+,(use "react-dom" for older versions)
  import { renderToString } from "react-dom/server";
  import { AuthProvider, type Auth } from "./react-auth";
  import Nested from "./HookWithContext.svelte";

  used(AuthProvider);

  const countHook = hooks(() => useState(0), ReactDOMClient, renderToString);

  const auth: Auth = { authenticated: false };
  function onLogin() {
    auth.authenticated = true;
  }
  function onLogout() {
    auth.authenticated = false;
  }
</script>

{#if $countHook}
  {@const [count, setCount] = $countHook}

  <div>Count: {count}</div>
  <button on:click={() => setCount(count + 1)}>+</button>
  <hr />
{/if}
<react:AuthProvider value={auth}>
  <Nested />
</react:AuthProvider>

{#if auth.authenticated}
  <button on:click={onLogout}>Logout</button>
{:else}
  <button on:click={onLogin}>Login</button>
{/if}
