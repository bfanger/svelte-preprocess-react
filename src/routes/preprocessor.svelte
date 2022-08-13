<script lang="ts">
  import Counter from "../demo/react-components/Counter";
  import Alert from "../demo/react-components/Alert";

  if (!Counter && !Alert) {
    // Bypass: is declared but its value is never read. (ts)
  }
</script>

<react:Counter initial={10} on:count={console.info} /><br />

<react:Counter initial={25} on:count={console.info} />

<react:Alert>A simple alert</react:Alert>

<react:Alert>
  "Multiline content". {10 ** 4} Lorem ipsum dolor sit amet consectetur adipisicing
  elit. Suscipit nisi atque asperiores.</react:Alert
>
