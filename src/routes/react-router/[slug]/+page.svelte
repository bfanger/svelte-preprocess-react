<script lang="ts">
  import { Link } from "svelte-preprocess-react/react-router";
  import { page } from "$app/stores";

  const react = sveltify({ Link });
</script>

<p>You're on the {$page.params.slug} page.</p>

<react.Link to="../../">Back to home</react.Link>
