<script lang="ts">
  import { page } from "$app/stores";
  import { used } from "svelte-preprocess-react";
  import { Link } from "svelte-preprocess-react/react-router";

  used(Link);
</script>

<p>You're on the {$page.params.slug} page.</p>

<react:Link to="../../">Back to home</react:Link>
