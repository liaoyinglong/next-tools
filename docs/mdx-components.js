import { Callout } from "fumadocs-ui/components/callout";
import defaultComponents from "fumadocs-ui/mdx";

export function useMDXComponents(components) {
  return {
    ...defaultComponents,
    Callout,
    ...components,
  };
}
