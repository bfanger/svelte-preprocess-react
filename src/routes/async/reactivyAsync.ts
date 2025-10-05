import { createElement, Fragment, useLayoutEffect, useRef } from "react";
import { mount, unmount, type Component } from "svelte";
import type { ChildrenPropsAsReactNode } from "svelte-preprocess-react/internal/types.js";
import Reactified from "./Reactified.svelte";
import { render } from "svelte/server";

const cache = new WeakMap<Component<any>, React.FunctionComponent<any>>();

/**
 * Convert a Svelte components into React components.
 */
export default function reactifyAsync<
  T extends Component<any> | Record<string, Component<any>>,
>(
  svelteComponents: T,
): T extends Component<infer TProps>
  ? React.FunctionComponent<ChildrenPropsAsReactNode<TProps>>
  : {
      [K in keyof T]: T[K] extends Component<infer TProps>
        ? React.FunctionComponent<ChildrenPropsAsReactNode<TProps>>
        : React.FunctionComponent<any>;
    } {
  if (typeof svelteComponents === "function") {
    return single(svelteComponents) as any;
  }
  const reactComponents: Record<string, React.FunctionComponent<any>> = {};
  for (const key in svelteComponents) {
    reactComponents[key] = single((svelteComponents as any)[key], key);
  }
  return reactComponents as any;
}

function single(SvelteComponent: Component, key?: string): React.FC<any> {
  const hit = cache.get(SvelteComponent);
  if (hit) {
    return hit;
  }
  const name = key ?? SvelteComponent.name ?? "anonymous";
  const named = {
    [name]({ children, ...props }: any) {
      if (typeof document === "undefined") {
        return ReactifiedServerComponent(SvelteComponent, props, children);
      } else {
        return ReactifiedClientComponent(SvelteComponent, props, children);
      }
    },
  };
  cache.set(SvelteComponent, named[name]);
  return named[name];
}

function ReactifiedClientComponent(
  SvelteComponent: Component,
  props: any,
  children: any,
) {
  const targetRef = useRef<HTMLElement>(null);
  const childrenRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const app = mount(Reactified, {
      target: targetRef.current!,
      props: {
        SvelteComponent,
        react$children: children,
        slot: childrenRef.current,
        props,
      },
    });
    return () => {
      void unmount(app);
    };
  }, []);
  return createElement(Fragment, null, [
    children &&
      createElement(
        "reactify-react-child",
        { key: "children", ref: childrenRef },
        children,
      ),
    createElement("reactify-svelte-mount", {
      ref: targetRef,
      key: "component",
    }),
  ]);
}

async function ReactifiedServerComponent(
  SvelteComponent: Component,
  props: any,
  children: any,
) {
  const { body } = await render(Reactified, {
    props: { SvelteComponent, props, react$children: children },
  });
  return createElement("reactify-svelte-render", {
    dangerouslySetInnerHTML: { __html: body },
  });
}
