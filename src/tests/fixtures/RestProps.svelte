<script lang="ts">
  import type React from "react";

  const props: React.JSX.IntrinsicElements["div"] = {
    style: { backgroundColor: "#fcdef6" },
    onClick: () => console.info("clicked"),
  };
</script>

<react.div aria-atomic={true} {...props} aria-label="after">
  <span>Hi</span>
</react.div>
