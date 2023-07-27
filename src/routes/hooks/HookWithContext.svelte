<script lang="ts">
  import { useAuth } from "./react-auth";
  import { hooks } from "$lib";

  const auth = hooks(useAuth);
</script>

{#if $auth?.authenticated}
  <div data-testid="authenticated">Authenticated</div>
{:else}
  <div data-testid="not-authenticated">Not authenticated</div>
{/if}
