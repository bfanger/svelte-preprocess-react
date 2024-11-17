<script lang="ts">
  import Alert from "../../demo/react-components/Alert";
  import Counter from "../../demo/react-components/Counter";

  const react = sveltify({ Counter, Alert });
</script>

<react.Counter initial={10} onCount={console.info} /><br />

<react.Counter initial={25} onCount={console.info} />

<react:Alert>A simple alert</react:Alert>

<react.Alert>
  "Multiline content". {10 ** 4} Lorem ipsum dolor sit amet consectetur adipisicing
  elit. Suscipit nisi atque asperiores.
</react.Alert>
<react.div>a div</react.div>
