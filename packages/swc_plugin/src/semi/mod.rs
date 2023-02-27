pub mod modularize_imports;
pub mod semi_css_omit;
mod semi_ui_map;
use serde::{Deserialize, Serialize};
use swc_core::common::collections::AHashMap;

#[derive(Debug, PartialEq, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SemiImportItem {
    #[serde(default)]
    pub path: String,

    #[serde(default)]
    pub is_named_import: bool,
}

pub type SemiImportMap = AHashMap<String, SemiImportItem>;
