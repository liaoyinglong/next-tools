use anyhow::Error;
use auto_namespace::option::AutoNamespaceOption;
use js_sys::JsString;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::prelude::JsValue;
use wasm_bindgen_futures::future_to_promise;

mod auto_namespace;
mod extract;
mod setup_handler;
mod transform;

use crate::extract::ExtractOptions;
use crate::transform::transform;

fn convert_err(err: Error) -> JsValue {
    format!("{:?}", err).into()
}

//#region extract
#[wasm_bindgen(js_name = "extractSync")]
pub fn extract_sync(source: JsString, filename: JsString) -> Result<JsValue, JsValue> {
    console_error_panic_hook::set_once();
    let res = extract::extract(ExtractOptions::new(source.into(), filename.into()))
        .map_err(convert_err)?;

    Ok(serde_wasm_bindgen::to_value(&res)?)
}
#[wasm_bindgen(js_name = "extract")]
pub fn extract(source: JsString, filename: JsString) -> js_sys::Promise {
    // TODO: This'll be properly scheduled once wasm have standard backed thread
    // support.
    future_to_promise(async { extract_sync(source, filename) })
}
//#endregion

//#region auto_namespace

#[wasm_bindgen(js_name = "autoNamespaceSync")]
pub fn auto_namespace_sync(source: JsString, namespace: JsString) -> Result<JsValue, JsValue> {
    console_error_panic_hook::set_once();
    let res = auto_namespace::auto_namespace(AutoNamespaceOption {
        source: source.into(),
        namespace: namespace.into(),

        ..Default::default()
    })
    .map_err(convert_err)?;

    Ok(res.into())
}
#[wasm_bindgen(js_name = "autoNamespace")]
pub fn auto_namespace(source: JsString, namespace: JsString) -> js_sys::Promise {
    future_to_promise(async { auto_namespace_sync(source, namespace) })
}

//#endregion
#[wasm_bindgen(js_name = "transformSync")]
pub fn transform_sync(source: JsString) -> Result<JsValue, JsValue> {
    console_error_panic_hook::set_once();
    let res = transform(source.into()).map_err(convert_err)?;
    Ok(res.into())
}
//#region format
