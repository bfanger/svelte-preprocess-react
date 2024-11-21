<script lang="ts">
  import type React from "react";

  const props: React.JSX.IntrinsicElements["div"] = {
    style: { backgroundColor: "#fcdef6" },
    onClick: () => console.info("clicked"),
  };
</script>

<react.div before={1} {...props} after="2"><span>Hi</span></react.div>
