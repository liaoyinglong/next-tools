import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div>
          <b>Dune Tools</b>{' '}
          <span style={{ opacity: '60%' }}>Dune Tools Collection</span>
        </div>
      ),
    },
  };
}
