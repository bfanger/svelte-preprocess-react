<script lang="ts">
  import Counter from "../demo/react-components/Counter";
  import sveltify from "$lib/sveltifyReact18";

  let toggle = true;
  let initialValue = 10;
  const ReactCounter = sveltify(Counter);
</script>

<label>
  <input type="checkbox" bind:checked={toggle} />
  {toggle}
</label>
{#if toggle}
  <ReactCounter {initialValue} />
{/if}

<div>
  <button
    on:click={() => {
      initialValue = Math.random();
    }}>Change</button
  >
</div>

<style>
  label {
    display: block;
    user-select: none;
    cursor: pointer;
  }
</style>
