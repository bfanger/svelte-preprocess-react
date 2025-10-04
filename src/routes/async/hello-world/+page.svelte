<script lang="ts">
  import React from "react";
  import sveltifyAsync from "../sveltifyAsync";

  function HelloWorld() {
    return React.createElement("h1", null, "Hello, world!");
  }

  const ReactHelloWorld = sveltifyAsync(HelloWorld);
</script>

<ReactHelloWorld />
