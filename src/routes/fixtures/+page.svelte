<script lang="ts">
  function getFiles() {
    const modules = import.meta.glob("../../tests/fixtures/*.svelte");
    return Object.keys(modules).map(
      (path) => /([^/]+)\.svelte$/.exec(path)?.[1],
    );
  }
</script>

<ul>
  {#each getFiles() as file}
    <li><a href="/fixtures/{file}">{file}</a></li>
  {/each}
</ul>
