<script lang="ts">
  import sveltify from "$lib/sveltify";
  import React, { createContext, createElement, useContext } from "react";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";

  const Context = createContext("It didn't work");
  const ProviderReact = Context.Provider;
  const ChildReact: React.FC = () => {
    const ctx = useContext(Context);
    return createElement("h1", {}, ctx);
  };
  const Provider = sveltify(
    ProviderReact,
    createElement,
    createPortal,
    ReactDOM
  );
  const Child = sveltify(ChildReact, createElement, createPortal, ReactDOM);
</script>

<Provider value="Hello from react context provider">
  <Child />
</Provider>
