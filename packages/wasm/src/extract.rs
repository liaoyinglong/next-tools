use anyhow::Error;
use swc_core::common::{FileName, FilePathMapping, SourceMap};
use swc_core::ecma::parser::parse_file_as_program;
use swc_core::ecma::parser::{Syntax, TsConfig};
use swc_core::ecma::visit::FoldWith;
use swc_core::ecma::visit::VisitMutWith;

use s_swc_visitor::get_folder;

use crate::extract_visitor::ExtractVisitor;

pub struct ExtractOptions {
    pub source: String,
}

impl ExtractOptions {
    pub fn new(source: String) -> Self {
        Self { source }
    }
}

pub fn extract(opts: ExtractOptions) -> Result<ExtractVisitor, Error> {
    let source_map = SourceMap::new(FilePathMapping::empty());
    let mut visitor = ExtractVisitor::new();
    let fm = source_map.new_source_file(FileName::Anon, opts.source);
    let program = parse_file_as_program(
        &*fm,
        Syntax::Typescript(TsConfig {
            tsx: true,
            ..Default::default()
        }),
        Default::default(),
        None,
        &mut vec![],
    );
    match program {
        Ok(program) => {
            let mut program = program.fold_with(&mut get_folder());
            program.visit_mut_with(&mut visitor);
        }
        Err(e) => return Err(Error::msg(format!(" {:?}", e)).context("Failed to parse file")),
    }
    dbg!(&visitor.data);
    Ok(visitor)
}

#[cfg(test)]
mod tests {
    use swc_core::common::collections::AHashMap;

    use crate::extract_visitor::Item;

    use super::*;

    #[test]
    fn test_extract() {
        let source = r#"
        t`hello ${name}`;
        <Trans>hello {name2}</Trans>;
        <Trans id="msg_id1">hello {name2}</Trans>;
        <Trans id={"msg_id2"}>hello {name2}</Trans>;
        <Trans id={`msg_id3`}>hello {name2}</Trans>;"#;

        let res = extract(ExtractOptions::new(source.into())).expect("failed to extract");

        assert_eq!(res.data.len(), 5);
        assert_eq!(res.data, {
            let mut map = AHashMap::default();
            map.insert(
                "hello {name}".into(),
                Item {
                    messages: "".to_string(),
                    id: "hello {name}".into(),
                },
            );
            map.insert(
                "hello {name2}".into(),
                Item {
                    messages: "".to_string(),
                    id: "hello {name2}".into(),
                },
            );
            map.insert(
                "msg_id1".into(),
                Item {
                    messages: "hello {name2}".to_string(),
                    id: "msg_id1".into(),
                },
            );
            map.insert(
                "msg_id2".into(),
                Item {
                    messages: "hello {name2}".to_string(),
                    id: "msg_id2".into(),
                },
            );
            map.insert(
                "msg_id3".into(),
                Item {
                    messages: "hello {name2}".to_string(),
                    id: "msg_id3".into(),
                },
            );
            map
        })
    }
}
