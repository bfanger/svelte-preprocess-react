import { createElement } from "react";
import { renderToString } from "react-dom/server";
import App from "../../demo/react-components/App";

const cssScript = `<script type="module" src="/src/demo/react-components/App.tsx"></script>`;
const hydrateScript = `<script type="module">
import App, { createElement, hydrateRoot } from "/src/demo/react-components/App.tsx";
hydrateRoot(document.querySelector("react-app"), createElement(App));
</script>`;

export function GET({ url }) {
  const html = renderToString(createElement(App));
  let script = "";
  if (url.searchParams.get("css")) {
    script += cssScript;
  }
  if (url.searchParams.get("hydrate")) {
    script = hydrateScript;
  }

  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React SSR</title>
    <script type="module" src="@vite/client"></script>
  </head>
  <body>
    <react-app>${html}</react-app>
    ${script}
  </body>
</html>
`,
    {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    },
  );
}
