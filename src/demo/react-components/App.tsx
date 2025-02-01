import * as React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { reactify } from "svelte-preprocess-react";
import Dog from "../../tests/fixtures/Dog.svelte";
import Children from "../../tests/fixtures/Children.svelte";
import DebugContextProvider from "../../demo/components/DebugContextProvider.svelte";
import DebugContext from "../../demo/components/DebugContext.svelte";

const svelte = reactify({ Dog, Children, DebugContextProvider, DebugContext });

export default function App() {
  return (
    <div>
      <h1>React app</h1>
      <svelte.Dog name="Scooby doo" onbark={() => console.info("Zoinks!")} />
      <svelte.Children>
        <div style={{ color: "#0b6a84" }}>
          React element inside a reactified Svelte component
        </div>
      </svelte.Children>
      <svelte.DebugContextProvider id="message" value="Svelte context value">
        <svelte.DebugContext id="message" />
      </svelte.DebugContextProvider>
    </div>
  );
}
const createElement = React.createElement;
export { createElement, hydrateRoot, createRoot };
