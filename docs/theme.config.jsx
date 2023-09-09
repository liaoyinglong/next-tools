import { getSandpackCssText } from "@codesandbox/sandpack-react";

// @see https://nextra.site/docs/docs-theme/theme-configuration
export default {
  logo: <span>dune Documentation</span>,
  project: {
    link: "https://bitbucket.org/liaoyinglong/next-tools",
  },
  head() {
    return (
      <style
        dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
        id="sandpack"
        key="sandpack-css"
      />
    );
  },
};
