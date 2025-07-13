import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree.children}
      nav={{
        title: (
          <div>
            <b>Dune Tools</b>{" "}
            <span style={{ opacity: "60%" }}>Dune Tools Collection</span>
          </div>
        ),
      }}
      sidebar={{
        defaultOpenLevel: 1,
      }}
      searchToggle={{
        enabled: false,
      }}
    >
      {children}
    </DocsLayout>
  );
}
