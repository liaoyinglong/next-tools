import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import browserCollections from 'collections/browser';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { Suspense } from 'react';
import { mdxComponents } from '@/components/mdx';
import { baseOptions, sidebarOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

const defaultDescription =
  'Dune Tools 文档，覆盖 @dune2/tools、@dune2/cli 和 @dune2/babel 的用法。';

function getPageMeta(data: unknown) {
  if (!data || typeof data !== 'object') {
    return {
      title: 'Dune Tools Documentation',
      description: defaultDescription,
    };
  }
  const title =
    'title' in data && typeof data.title === 'string'
      ? data.title
      : 'Dune Tools Documentation';
  const description =
    'description' in data && typeof data.description === 'string'
      ? data.description
      : defaultDescription;
  return { title, description };
}

function getCanonicalUrl(pathname: string) {
  const siteUrl = import.meta.env.VITE_DOCS_SITE_URL;
  return siteUrl ? new URL(pathname, siteUrl).toString() : pathname;
}

export const Route = createFileRoute('/docs/$')({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split('/') ?? [];
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title
      ? `${loaderData.title} | Dune Tools`
      : 'Dune Tools Documentation';
    const description = loaderData?.description ?? defaultDescription;
    const canonical = getCanonicalUrl(loaderData?.path ?? '/docs');
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [{ rel: 'canonical', href: canonical }],
    };
  },
});

const serverLoader = createServerFn({
  method: 'GET',
})
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();

    const meta = getPageMeta(page.data);
    return {
      path: page.path,
      pageTree: await source.serializePageTree(source.getPageTree()),
      title: meta.title,
      description: meta.description,
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MDX }, _props: undefined) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX components={mdxComponents} />
        </DocsBody>
      </DocsPage>
    );
  },
});

function Page() {
  const data = useFumadocsLoader(Route.useLoaderData());

  return (
    <DocsLayout
      {...baseOptions()}
      tree={data.pageTree}
      sidebar={sidebarOptions}
    >
      <Suspense>{clientLoader.useContent(data.path)}</Suspense>
    </DocsLayout>
  );
}
