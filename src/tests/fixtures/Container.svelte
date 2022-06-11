<script>
  // @ts-nocheck
  import Counter from "./Counter";

  let count = 1;
</script>

<react:Counter
  {count}
  on:count={(next) => {
    count = next;
  }}
/>
<react:Counter count={2} onCount={() => {}} />
