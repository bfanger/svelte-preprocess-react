<script lang="ts">
  import { page } from "$app/stores";
  import { used } from "$lib";
  import { Link } from "$lib/react-router";

  used(Link);
</script>

<p>You're on the {$page.params.slug} page.</p>

<react:Link to="../../">Back to home</react:Link>
