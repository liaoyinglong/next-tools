import { mapProps } from "@dune2/tools/factory/mapProps";
import dynamic from "next/dynamic";

const Sandpack = dynamic(
  () => import("@codesandbox/sandpack-react").then((r) => r.Sandpack),
  {
    ssr: false,
  }
);

export const LiveCode = mapProps(Sandpack, {
  theme: "auto",
  template: "react",
  options: {
    showInlineErrors: true, // default - false
    wrapContent: true, // default - false
    editorHeight: "auto", // default - 300
  },
  customSetup: {
    dependencies: {
      "@dune2/tools": "latest",
      "@tanstack/react-query": "^4.29.7",
    },
  },
});
