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
        let mut source = String::new();
        source.push_str("t`hello ${name}`;");
        source.push_str("<Trans>hello {name2}</Trans>;");
        source.push_str(r#"<Trans id="msg_id1">hello {name2}</Trans>;"#);
        source.push_str(r#"<Trans id={"msg_id2"}>hello {name2}</Trans>;"#);
        source.push_str("<Trans id={`msg_id3`}>hello {name2}</Trans>;");
        source.push_str(
            r#"
            <Trans>
               Welcome to <a>Next.js!</a> {counter}
            </Trans>;"#,
        );
        // 以下无法提取
        source.push_str("t(`error_${errorCode}`);"); // 提取不到
        source.push_str("i18n.t('welcome');");

        let res = extract(ExtractOptions::new(source)).expect("failed to extract");
        let mut map = AHashMap::default();
        let mut insert = |id: &str, message: &str| {
            map.insert(
                id.to_string(),
                Item {
                    id: id.into(),
                    messages: message.into(),
                },
            );
        };
        insert("hello {name}", "");
        insert("hello {name2}", "");
        insert("msg_id1", "hello {name2}");
        insert("msg_id2", "hello {name2}");
        insert("msg_id3", "hello {name2}");
        insert("Welcome to <0>Next.js!</0> {counter}", "");
        assert_eq!(res.data.len(), map.len());
        assert_eq!(res.data, map);
    }
}
