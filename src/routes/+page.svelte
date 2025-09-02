<script lang="ts">
  import { resolve } from "$app/paths";
</script>

<img
  src="/svelte-preprocess-react.svg"
  alt="Svelte logo in react colors and the React logo in svelte colors"
/>
<ul>
  <li><a href={resolve("/preprocessor")}>via preprocessor</a></li>
  <li><a href={resolve("/sveltify-react")}>via sveltifyReact</a></li>

  <li><a href={resolve("/context-svelte")}>getContext()</a></li>
  <li><a href={resolve("/context-react")}>useContext()</a></li>

  <li><a href={resolve("/hooks")}>Using hooks</a></li>

  <li><a href={resolve("/react-router/home")}>react-router</a></li>
  <li><a href={resolve("/lazy")}>react lazy</a></li>
  <li><a href={resolve("/youtube/react")}>sveltefied react-youtube</a></li>
  <li>
    <a href={resolve("/youtube/svelte")}>reactified svelte-youtube-lite</a>
  </li>
</ul>
