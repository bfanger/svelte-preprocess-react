<script lang="ts">
  import List from "./List";

  const react = sveltify({ List });
</script>

<react.List>
  <react.List.Item label="1" />
  <react.List.Item>Item 2</react.List.Item>
  <react.List.Item>Item <span>3</span></react.List.Item>
  <react.List.Item
    ><react.List.Item.Icon icon="chevron-right" /></react.List.Item
  >
</react.List>
