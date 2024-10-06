<script lang="ts">
  import { useState } from "react";
  import ReactDOMClient from "react-dom/client"; // React 18+,(use "react-dom" for older versions)
  import { renderToString } from "react-dom/server";
  import { hooks, used } from "svelte-preprocess-react";
  import Nested from "./HookWithContext.svelte";
  import { type Auth, AuthProvider } from "./react-auth";

  used(AuthProvider);

  const countHook = hooks(() => useState(0), ReactDOMClient, renderToString);

  const auth: Auth = $state({ authenticated: false });
  function onLogin() {
    auth.authenticated = true;
  }
  function onLogout() {
    auth.authenticated = false;
  }
</script>

{#if $countHook}
  {@const [count, setCount] = $countHook}

  <div>Count: <span data-testid="count">{count}</span></div>
  <button
    data-testid="add"
    onclick={() => {
      setCount(count + 1);
    }}>+</button
  >
  <hr />
{/if}
<react:AuthProvider value={auth}>
  <Nested />
</react:AuthProvider>

{#if auth.authenticated}
  <button onclick={onLogout} data-testid="logout">Logout</button>
{:else}
  <button onclick={onLogin} data-testid="login">Login</button>
{/if}
