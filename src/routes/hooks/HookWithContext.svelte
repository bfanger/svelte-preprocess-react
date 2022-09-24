<script lang="ts">
  import { hooks } from "$lib";
  import { useAuth } from "./react-auth";

  const auth = hooks(useAuth);
</script>

{#if $auth?.authenticated}
  <div data-testid="authenticated">Authenticated</div>
{:else}
  <div data-testid="not-authenticated">Not authenticated</div>
{/if}
