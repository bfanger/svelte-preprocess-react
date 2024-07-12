<script lang="ts">
  import { used } from "svelte-preprocess-react";
  import { Link } from "svelte-preprocess-react/react-router";
  import { page } from "$app/stores";

  used(Link);
</script>

<p>You're on the {$page.params.slug} page.</p>

<react:Link to="../../">Back to home</react:Link>
