<script lang="ts">
  import Clicker from "./Clicker";

  const react = sveltify({ Clicker });

  let count = 1;
</script>

<h2>prop and event</h2>
<react.Clicker
  {count}
  onCount={(next) => {
    count = next;
  }}
></react.Clicker>
<h2>prop and Prop event</h2>
<react.Clicker
  count={10}
  onCount={() => {
    console.info("count");
  }}
></react.Clicker>
<h2>prop</h2>
<react.Clicker {count}></react.Clicker>
<h2>.</h2>
<react.Clicker></react.Clicker>
