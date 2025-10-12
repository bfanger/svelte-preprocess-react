<script lang="ts">
  import reactifyAsync from "../reactifyAsync";
  import sveltifyAsync from "../sveltifyAsync";
  import Button from "../../../demo/components/Button.svelte";

  const SvelteButton = reactifyAsync(Button);
  const ReactButton = sveltifyAsync(SvelteButton);
</script>

<ReactButton onClick={() => console.info("Button clicked!")}>
  Click me
</ReactButton>
