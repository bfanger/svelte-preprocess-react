<script lang="ts">
  import used from "./used";

  export let use: () => any;
  export let out: any = undefined;

  let ready = false;

  function setValue(value: any) {
    out = value;
    ready = true;
  }

  function Hook<T>(props: { use: () => T; setValue(val: T): void }) {
    const value = props.use();
    props.setValue(value);
    return null;
  }
  used(Hook);
</script>

<react:Hook {use} {setValue} />
{#if ready}
  <slot {out} />
{/if}
