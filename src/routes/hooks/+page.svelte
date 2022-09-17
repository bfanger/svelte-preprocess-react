<script lang="ts">
  import { Hook } from "$lib";
  import { useState } from "react";

  function useSomeState() {
    return useState("Initial value");
  }

  function useMultipleHooks() {
    const [x] = useState(1);
    const [y] = useState(2);
    return { x, y };
  }
</script>

<Hook use={useSomeState} let:out={[value, setValue]}>
  <div>{value}</div>
  <button
    on:click={() => {
      setValue("Changed");
    }}>Change</button
  >
</Hook>
<hr />
<Hook use={useMultipleHooks} let:out={position}>
  x: {position.x}
  y: {position.y}
</Hook>
