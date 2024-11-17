<script lang="ts">
  import { Excalidraw, WelcomeScreen, MainMenu } from "@excalidraw/excalidraw";
  import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

  const react = sveltify({ Excalidraw, WelcomeScreen, MainMenu });
  let excalidrawAPI: ExcalidrawImperativeAPI | undefined = $state();

  $effect(() => {
    return excalidrawAPI?.onChange(console.info);
  });
</script>

Example inspired by:
<a href="https://www.youtube.com/watch?v=SKUD-Aj1jKg"
  >Using React Libraries Inside Svelte - Joy of Code
</a>

<div style="height: 100vh">
  <react.Excalidraw
    theme="dark"
    excalidrawAPI={(api) => {
      excalidrawAPI = api;
    }}
  >
    <react.WelcomeScreen />
    <react.MainMenu>
      <react.MainMenu.DefaultItems.LoadScene />
      <react.MainMenu.DefaultItems.Export />
      <react.MainMenu.DefaultItems.SaveAsImage />
      <react.MainMenu.Separator />
      <react.MainMenu.DefaultItems.ChangeCanvasBackground />
    </react.MainMenu>
  </react.Excalidraw>
</div>
