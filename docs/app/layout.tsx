/* eslint-env node */
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import "nextra-theme-docs/style.css";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";

export const metadata = {
  //metadataBase: new URL("https://nextra.site"),
  title: {
    template: "%s - Dune Tools Documentation",
  },
  description: "Dune Tools Documentation",
  applicationName: "Dune Tools",
  generator: "Next.js",
  appleWebApp: {
    title: "Dune Tools",
  },

  //twitter: {
  //site: "https://nextra.site",
  //},
};

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <div>
          <b>Dune Tools</b>{" "}
          <span style={{ opacity: "60%" }}>Dune Tools Collection</span>
        </div>
      }
      // Next.js discord server
      //chatLink="https://discord.gg/hEM84NMkRv"
    />
  );
  return (
    <html lang="zh-CN" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="✦" />
      <body>
        <Layout
          navbar={navbar}
          footer={<Footer />}
          //editLink="Edit this page on GitHub"
          //docsRepositoryBase="https://github.com/shuding/nextra/blob/main/examples/docs"
          feedback={{
            content: null,
          }}
          editLink={null}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          pageMap={await getPageMap()}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
