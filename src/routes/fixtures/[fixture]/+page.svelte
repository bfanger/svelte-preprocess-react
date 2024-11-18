<script lang="ts">
  let { data } = $props();
</script>

<header>
  <h1>{data.title}</h1>
</header>
<data.Fixture />

<style>
  header {
    background: #5c1eba;
    color: white;
    padding: 0.6em;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 2em;
  }

  h1 {
    font: 24px/1.1 sans-serif;
    margin: 0;
  }
</style>
