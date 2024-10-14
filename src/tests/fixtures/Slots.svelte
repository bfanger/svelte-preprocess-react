<script lang="ts">
  import { used } from "svelte-preprocess-react";
  import Alert from "../../demo/react-components/Alert";

  used(Alert);
</script>

<react:Alert>A simple primary alert. Check it out!</react:Alert>
