use anyhow::Error;
use once_cell::sync::Lazy;
use s_swc_plugin::visitors::{t_fn::*, trans::*};
use serde::Deserialize;
use std::sync::Arc;
use swc_core::base::TransformOutput;
use swc_core::common::chain;
use swc_core::ecma::visit::as_folder;
use swc_core::{
    base::{try_with_handler, Compiler},
    common::{errors::ColorConfig, FileName, FilePathMapping, SourceMap},
    ecma::transforms::base::pass::noop,
};
use wasm_bindgen::prelude::*;

fn convert_err(err: Error) -> JsValue {
    format!("{:?}", err).into()
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransformOptions {
    #[serde(flatten)]
    pub swc: swc_core::base::config::Options,
}
pub fn extract(source: String, opts: TransformOptions) -> Result<TransformOutput, JsValue> {
    let c = compiler();

    try_with_handler(
        c.cm.clone(),
        swc_core::base::HandlerOpts {
            color: ColorConfig::Never,
            skip_filename: false,
        },
        |handler| {
            let fm = c.cm.new_source_file(
                if opts.swc.filename.is_empty() {
                    FileName::Anon
                } else {
                    FileName::Real(opts.swc.filename.clone().into())
                },
                source,
            );

            let out = c.process_js_with_custom_pass(
                fm,
                None,
                handler,
                &opts.swc,
                |_, _comments| as_folder(chain!(TFunctionVisitor {}, TransVisitor {})),
                |_, _| noop(),
            )?;
            dbg!(&out);
            Ok(out)
        },
    )
    .map_err(convert_err)
}

/// Get global sourcemap
fn compiler() -> Arc<Compiler> {
    static C: Lazy<Arc<Compiler>> = Lazy::new(|| {
        let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));

        Arc::new(Compiler::new(cm))
    });

    C.clone()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transform_sync() {
        let source = r#"t`hello ${name}`"#;
        let opts = r#"{
    "filename": "input.jsx",
    "jsc": {
      "parser": {
        "syntax": "ecmascript",
        "jsx": true
      }
    }
  }"#;
        extract(
            source.into(),
            TransformOptions {
                swc: serde_json::from_str(opts).unwrap(),
            },
        )
        .unwrap();
    }
}
