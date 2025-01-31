import * as React from "react";
import { createRoot } from "react-dom/client";
import { reactify } from "svelte-preprocess-react";
import DogSvelte from "./Dog.svelte";
import ChildrenSvelte from "./Children.svelte";

const el = document.querySelector("react-app");
if (!el) {
  throw new Error("<react-app> not found");
}
const Dog = reactify(DogSvelte);
const Children = reactify(ChildrenSvelte);

function App() {
  return (
    <div>
      <h1>React app</h1>
      <Dog name="Scooby doo" />
      <Children>
        <div style={{ color: "#0b6a84" }}>
          React element inside a reactified Svelte component
        </div>
      </Children>
    </div>
  );
}
createRoot(el).render(<App />);
