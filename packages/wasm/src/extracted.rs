use serde::*;
use swc_core::common::collections::AHashMap;
use swc_core::common::Loc;

#[derive(Debug, Default, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Extracted {
    #[serde(default)]
    pub data: AHashMap<String, Item>,

    // 会在 提取完成后 被 赋值
    #[serde(default)]
    pub filename: String,

    // 会在 提取完成后 被 赋值
    #[serde(default)]
    pub err_msg: String,
}

impl Extracted {
    pub fn try_add(&mut self, id: String, messages: String, loc: Loc) {
        let new_item = Item {
            id,
            messages,
            line: loc.line,
            column: loc.col_display,
        };

        self.data.insert(new_item.id.clone(), new_item);
    }
}

#[derive(Debug, PartialEq, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    // 翻译文案的id
    #[serde(default, skip_deserializing)]
    pub id: String,
    // 默认的翻译文案
    #[serde(default)]
    pub messages: String,

    //  行号
    #[serde(default)]
    pub line: usize,
    //  列号
    #[serde(default)]
    pub column: usize,
}
