<script lang="ts">
  let value = "";
  function onChange(e: { target: { value: string } }) {
    value = e.target.value;
  }
</script>

<react:input {value} on:change={onChange} />

{value}
