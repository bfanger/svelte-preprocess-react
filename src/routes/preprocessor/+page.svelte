<script lang="ts">
  import { used } from "svelte-preprocess-react";
  import Alert from "../../demo/react-components/Alert";
  import Counter from "../../demo/react-components/Counter";

  used(Counter, Alert); // Bypass linting errors: is declared but its value is never read. (ts)
</script>

<react:Counter initial={10} onCount={console.info}></react:Counter><br />

<react:Counter initial={25} onCount={console.info}></react:Counter>

<react:Alert>A simple alert</react:Alert>

<react:Alert>
  "Multiline content". {10 ** 4} Lorem ipsum dolor sit amet consectetur adipisicing
  elit. Suscipit nisi atque asperiores.</react:Alert
>
<react:div>a div</react:div>
