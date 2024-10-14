<script lang="ts">
  import { used } from "svelte-preprocess-react";
  import YouTube from "react-youtube";

  used(YouTube);
</script>

<react:YouTube videoId="DXQl1G54DJY" opts={{ playerVars: { start: 2569 } }}
></react:YouTube>
