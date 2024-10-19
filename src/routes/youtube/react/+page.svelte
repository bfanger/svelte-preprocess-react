<script lang="ts">
  import YouTube from "react-youtube";

  const react = sveltify({ YouTube });
</script>

<react.YouTube videoId="DXQl1G54DJY" opts={{ playerVars: { start: 2569 } }}
></react.YouTube>
