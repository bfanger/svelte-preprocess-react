<!-- svelte-ignore a11y-no-static-element-interactions -->
<react:button on:click={() => console.info("clicked")} on:keydown>
  <slot />
</react:button>
