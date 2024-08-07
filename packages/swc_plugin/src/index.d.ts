export interface SwcPluginOptions {
  /// 是否开启 semi-css-omit，即是否移除 js 中的 css import/require
  /// 对齐 SemiWebpackPlugin 的 omitCss 功能
  enable_semi_css_omit?: boolean;
  /// 优化 semi-ui 的 barrel file 导出
  /// 类似 babel-plugin-import 能力
  /// 精确导入文件，加快编译速度
  enable_semi_modularize_import?: boolean;
  /// 外部额外配置的 semi-ui 的导入映射
  extra_semi_import_map?: Record<
    string,
    { path: string; is_named_import: boolean }
  >;
}
