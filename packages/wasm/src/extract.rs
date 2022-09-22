use std::borrow::Borrow;
use std::sync::Arc;

use anyhow::Error;
use once_cell::sync::Lazy;
use serde::Deserialize;
use swc_core::base::config::ParseOptions;
use swc_core::ecma::visit::as_folder;
use swc_core::ecma::visit::FoldWith;
use swc_core::{
    base::{try_with_handler, Compiler},
    common::{errors::ColorConfig, FileName, FilePathMapping, SourceMap},
};
use wasm_bindgen::prelude::*;

use s_swc_plugin::get_folder;

use crate::extract_visitor::ExtractVisitor;

fn convert_err(err: Error) -> JsValue {
    format!("{:?}", err).into()
}

pub fn extract(source: String, opts: ParseOptions) -> Result<(), Error> {
    let c = compiler();
    let visitor = ExtractVisitor {
        msgs: Default::default(),
    };
    try_with_handler(
        c.cm.clone(),
        swc_core::base::HandlerOpts {
            color: ColorConfig::Never,
            skip_filename: false,
        },
        |handler| {
            let fm = c.cm.new_source_file(FileName::Anon, source);
            let program =
                c.parse_js(fm, handler, opts.target, opts.syntax, opts.is_module, None)?;
            let program = program.fold_with(&mut get_folder("unknown".to_string()));
            program.fold_with(&mut as_folder(visitor));
            dbg!(&visitor.msgs);
            Ok(())
        },
    )?;
    Ok(())
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
    use swc_core::ecma::parser::Syntax;

    use super::*;

    #[test]
    fn test_transform_sync() {
        let source = r#"t`hello ${name}`;<Trans id="hello ${name2}" />"#;
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
            ParseOptions {
                comments: false,
                syntax: Syntax::Typescript(Default::default()),
                is_module: Default::default(),
                target: Default::default(),
            },
        )
        .unwrap();
    }
}
