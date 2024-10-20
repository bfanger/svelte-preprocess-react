<script lang="ts">
  import type * as React from "react";

  const Broken: React.FC = () => {
    const condition = true;
    if (condition) {
      throw new Error("Oops, something went wrong!");
    }
    return "didn't throw?";
  };

  const react = sveltify({
    Broken,
  });
</script>

<react.Broken />
