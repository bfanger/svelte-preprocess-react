<script lang="ts">
  import type React from "react";
  import { createContext, createElement, use } from "react";
  import { sveltify } from "svelte-preprocess-react";

  const Context = createContext("It didn't work");
  const Heading: React.FC = () => {
    const ctx = use(Context);
    return createElement("h1", {}, ctx);
  };
  const react = sveltify({ Context, Heading });
</script>

<react.Context value="Hello from react context provider">
  <react.Heading />
</react.Context>
