<script>
  // @ts-nocheck
  import Clicker from "./Clicker";

  let count = 1;
</script>

<h2>prop and event</h2>
<react:Clicker
  {count}
  on:count={(next) => {
    count = next;
  }}
/>
<h2>prop and Prop event</h2>
<react:Clicker
  count={10}
  onCount={() => {
    console.info("count");
  }}
/>
<h2>prop</h2>
<react:Clicker {count} />
<h2>.</h2>
<react:Clicker />
