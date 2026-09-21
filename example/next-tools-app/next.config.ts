import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @dune2/tools 发布的是 TS 源码（exports 直接指向 .ts/.tsx），
  // 消费方必须让 Next 一起编译它，否则 node_modules 里的 TS 不会被处理。
  transpilePackages: ['@dune2/tools'],
};

export default nextConfig;
