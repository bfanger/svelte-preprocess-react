import React18Wrapper from "./internal/React18Wrapper.svelte";
import createSveltifyReact from "./internal/createSveltifyReact";

const sveltifyReact17 = createSveltifyReact(React18Wrapper);
export default sveltifyReact17;
