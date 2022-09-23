use std::sync::Arc;

use anyhow::Error;
use once_cell::sync::Lazy;
use s_swc_plugin::get_folder;
use swc_core::base::config::ParseOptions;
use swc_core::ecma::visit::FoldWith;
use swc_core::ecma::visit::VisitMutWith;
use swc_core::{
    base::{try_with_handler, Compiler},
    common::{errors::ColorConfig, FileName, FilePathMapping, SourceMap},
};

use crate::extract_visitor::ExtractVisitor;

pub fn extract(source: String, opts: ParseOptions) -> Result<ExtractVisitor, Error> {
    let c = compiler();
    let mut visitor = ExtractVisitor::new();
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
    use swc_core::ecma::parser::{Syntax, TsConfig};

    use super::*;

    #[test]
    fn test_transform_sync() {
        let source = r#"t`hello ${name}`;<Trans>hello {name2}</Trans>"#;

        let res = extract(
            source.into(),
            ParseOptions {
                comments: false,
                syntax: Syntax::Typescript(TsConfig {
                    tsx: true,
                    decorators: false,
                    dts: false,
                    no_early_errors: false,
                }),
                is_module: Default::default(),
                target: Default::default(),
            },
        )
        .expect("failed to extract");

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
