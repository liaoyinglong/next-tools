use crate::extract::*;
use anyhow::Error;
use js_sys::JsString;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::prelude::JsValue;

mod extract;
mod extract_visitor;

fn convert_err(err: Error) -> JsValue {
    format!("{:?}", err).into()
}

#[wasm_bindgen(js_name = "extractSync")]
pub fn extract_sync(source: JsString) -> Result<JsValue, JsValue> {
    console_error_panic_hook::set_once();
    let res = extract(ExtractOptions::new(source.into()))
        .map(|res| res.data)
        .map_err(convert_err)?;

    Ok(serde_wasm_bindgen::to_value(&res)?)
}
