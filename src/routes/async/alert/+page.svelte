<script lang="ts">
  import Alert from "../../../demo/react-components/Alert";
  import sveltifyAsync from "../sveltifyAsync";

  const ReactAlert = sveltifyAsync(Alert);
</script>

<ReactAlert>Content</ReactAlert>
