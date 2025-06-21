import type { Component } from "svelte";

export async function load({ params }) {
  return {
    title: params.fixture,
    Fixture: await getModule(params.fixture),
  };
}

async function getModule(name: string) {
  const modules = import.meta.glob("../../../tests/fixtures/*.svelte");
  const loader = Object.entries(modules).find(
    ([path]) => /([^/]+)\.svelte$/.exec(path)?.[1] === name,
  );
  if (!loader) {
    throw new Error(`Fixture not found: ${name}`);
  }
  const module = await loader[1]();
  return (module as { default: Component }).default;
}
