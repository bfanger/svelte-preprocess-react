<script lang="ts">
  import { hooks } from "svelte-preprocess-react";
  import { useAuth } from "./react-auth";

  let auth = $derived(hooks(useAuth));
</script>

{#if auth?.authenticated}
  <div data-testid="authenticated">Authenticated</div>
{:else}
  <div data-testid="not-authenticated">Not authenticated</div>
{/if}
