<script>
  // @ts-nocheck
  let count = 1;
</script>

<react:Counter
  {count}
  on:count={(next) => {
    count = next;
  }}
/>
