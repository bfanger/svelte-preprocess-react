import * as React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { reactify } from "svelte-preprocess-react";
import DogSvelte from "../../tests/fixtures/Dog.svelte";
import ChildrenSvelte from "../../tests/fixtures/Children.svelte";
import DebugContextProviderSvelte from "../../demo/components/DebugContextProvider.svelte";
import DebugContextSvelte from "../../demo/components/DebugContext.svelte";

const Dog = reactify(DogSvelte);
const Children = reactify(ChildrenSvelte);
const DebugContextProvider = reactify(DebugContextProviderSvelte);
const DebugContext = reactify(DebugContextSvelte);

export default function App() {
  return (
    <div>
      <h1>React app</h1>
      <Dog name="Scooby doo" />
      <Children>
        <div style={{ color: "#0b6a84" }}>
          React element inside a reactified Svelte component
        </div>
      </Children>
      <DebugContextProvider id="message">
        <DebugContext />
      </DebugContextProvider>
    </div>
  );
}
const createElement = React.createElement;
export { createElement, hydrateRoot, createRoot };
