<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
<react:button on:click={() => console.info("clicked")}>
  <slot />
</react:button>
