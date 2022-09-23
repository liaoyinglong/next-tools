use std::sync::Arc;

use anyhow::Error;
use once_cell::sync::Lazy;
use s_swc_visitor::get_folder;
use swc_core::base::config::ParseOptions;
use swc_core::ecma::parser::{Syntax, TsConfig};
use swc_core::ecma::visit::FoldWith;
use swc_core::ecma::visit::VisitMutWith;
use swc_core::{
    base::{try_with_handler, Compiler},
    common::{errors::ColorConfig, FileName, FilePathMapping, SourceMap},
};

use crate::extract_visitor::ExtractVisitor;

pub struct ExtractOptions {
    pub parse: ParseOptions,
    pub source: String,
}

impl ExtractOptions {
    pub fn new(source: String) -> Self {
        Self {
            parse: ParseOptions {
                syntax: Syntax::Typescript(TsConfig {
                    tsx: true,
                    ..Default::default()
                }),
                ..Default::default()
            },
            source,
        }
    }
}

pub fn extract(opts: ExtractOptions) -> Result<ExtractVisitor, Error> {
    let c = compiler();
    let mut visitor = ExtractVisitor::new();
    try_with_handler(
        c.cm.clone(),
        swc_core::base::HandlerOpts {
            color: ColorConfig::Never,
            skip_filename: false,
        },
        |handler| {
            let fm = c.cm.new_source_file(FileName::Anon, opts.source);
            let program = c.parse_js(
                fm,
                handler,
                opts.parse.target,
                opts.parse.syntax,
                opts.parse.is_module,
                None,
            )?;
            let mut program = program.fold_with(&mut get_folder("unknown".to_string()));
            program.visit_mut_with(&mut visitor);
            Ok(())
        },
    )?;
    dbg!(&visitor.data);
    Ok(visitor)
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
    use crate::extract_visitor::Item;
    use swc_core::common::collections::AHashMap;

    use super::*;

    #[test]
    fn test_transform_sync() {
        let source = r#"t`hello ${name}`;<Trans>hello {name2}</Trans>"#;

        let res = extract(ExtractOptions::new(source.into())).expect("failed to extract");

        assert_eq!(res.data.len(), 2);
        assert_eq!(res.data, {
            let mut map = AHashMap::default();
            map.insert(
                "hello {name}".into(),
                Item {
                    defaults: "".to_string(),
                    id: "hello {name}".into(),
                },
            );
            map.insert(
                "hello {name2}".into(),
                Item {
                    defaults: "".to_string(),
                    id: "hello {name2}".into(),
                },
            );
            map
        })
    }
}
