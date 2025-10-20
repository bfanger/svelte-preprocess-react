<script lang="ts">
  import { useState } from "react";
  import HookWithContext from "./HookWithContext.svelte";
  import { type Auth, AuthProvider } from "./react-auth";
  import { hooks } from "svelte-preprocess-react";

  const react = sveltify({ AuthProvider });
  let [count, setCount] = $derived.by(await hooks(() => useState(0)));

  const auth: Auth = $state({ authenticated: false });

  function onLogin() {
    auth.authenticated = true;
  }
  function onLogout() {
    auth.authenticated = false;
  }
</script>

<div>Count: <span data-testid="count">{count}</span></div>
<button
  data-testid="add"
  onclick={() => {
    setCount(count + 1);
  }}>+</button
>
<hr />

<react.AuthProvider value={auth}>
  <HookWithContext />
</react.AuthProvider>

{#if auth.authenticated}
  <button onclick={onLogout} data-testid="logout">Logout</button>
{:else}
  <button onclick={onLogin} data-testid="login">Login</button>
{/if}
