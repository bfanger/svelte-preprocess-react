<script lang="ts">
  import sveltify from "$lib/sveltify";
  import React, { createContext, createElement, useContext } from "react";
  import { createPortal } from "react-dom";
  import ReactDOM from "react-dom/client";
  import { renderToString } from "react-dom/server";

  const Context = createContext("It didn't work");
  const ProviderReact = Context.Provider;
  const ChildReact: React.FC = () => {
    const ctx = useContext(Context);
    return createElement("h1", {}, ctx);
  };
  const Provider = sveltify(
    ProviderReact,
    createPortal,
    ReactDOM,
    renderToString
  );
  const Child = sveltify(ChildReact, createPortal, ReactDOM, renderToString);
</script>

<Provider value="Hello from react context provider">
  <Child />
</Provider>
