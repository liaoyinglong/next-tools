use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Deserialize, Serialize, Clone, Default)]
pub struct PluginConfig {
    /// 是否开启 semi-css-omit，即是否移除 js 中的 css import/require
    /// 对齐 SemiWebpackPlugin 的 omitCss 功能
    #[serde(default)]
    pub enable_semi_css_omit: bool,
}
