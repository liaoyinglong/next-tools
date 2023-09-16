import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

// @see https://nextra.site/docs/docs-theme/theme-configuration
export default {
  logo: <span>dune Documentation</span>,
  project: {
    link: "https://bitbucket.org/liaoyinglong/next-tools",
  },
  main: (props) => {
    return <Theme>{props.children}</Theme>;
  },
};
