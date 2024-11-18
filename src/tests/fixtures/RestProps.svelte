<script lang="ts">
  import type React from "react";

  const props: React.JSX.IntrinsicElements["div"] = {
    style: { backgroundColor: "#4c80db" },
    onClick: () => console.info("clicked"),
  };
</script>

<react.div {...props}><span>Hi</span></react.div>
