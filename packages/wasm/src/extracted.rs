use serde::*;
use swc_core::common::collections::AHashMap;

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
    // 无法获取到行号，可能是因为修改了 ast
    // see https://github.com/swc-project/swc/issues/1994#issuecomment-891966430
    pub fn try_add(&mut self, id: String, messages: String) {
        let new_item = Item { id, messages };

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
}
