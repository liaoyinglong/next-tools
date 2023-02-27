use crate::semi::SemiImportMap;
use serde::{Deserialize, Serialize};
use swc_core::ecma::ast::ModuleExportName;

pub fn module_export_name_to_string(name: ModuleExportName) -> String {
    match name {
        ModuleExportName::Ident(id) => id.sym.to_string(),
        ModuleExportName::Str(str) => str.value.to_string(),
    }
}

#[derive(Debug, PartialEq, Deserialize, Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct PluginConfig {
    /// 是否开启 semi-css-omit，即是否移除 js 中的 css import/require
    /// 对齐 SemiWebpackPlugin 的 omitCss 功能
    #[serde(default = "true_by_default")]
    pub enable_semi_css_omit: bool,

    /// 优化 semi-ui 的 barrel file 导出
    /// 类似 babel-plugin-import 能力
    /// 精确导入文件，加快编译速度
    #[serde(default = "true_by_default")]
    pub enable_semi_modularize_import: bool,

    /// 外部额外配置的 semi-ui 的导入映射
    #[serde(default)]
    pub extra_semi_import_map: SemiImportMap,
}
fn true_by_default() -> bool {
    true
}
