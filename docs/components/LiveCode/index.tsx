import { Sandpack } from "@codesandbox/sandpack-react";
import { mapProps } from "@dune2/tools";

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
    },
  },
});
