<script lang="ts">
  import { hooks } from "$lib";
  import { useAuth } from "./react-auth";

  const auth = hooks(useAuth);
</script>

{#if $auth?.authenticated}
  <div>Authenticated</div>
{:else}
  <div>Not authenticated</div>
{/if}
