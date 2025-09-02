<script lang="ts">
  import { resolve } from "$app/paths";
  function getFiles() {
    const modules = import.meta.glob("../../tests/fixtures/*.svelte");
    return Object.keys(modules).map(
      (path) => /([^/]+)\.svelte$/.exec(path)?.[1],
    );
  }
</script>

<ul>
  {#each getFiles() as file}
    {#if file}<li>
        <a href={resolve("/fixtures/[fixture]", { fixture: file })}>{file}</a>
      </li>
    {/if}
  {/each}
</ul>
