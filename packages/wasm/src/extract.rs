use anyhow::Error;
use s_swc_visitor::get_folder;
use swc_core::common::sync::Lrc;
use swc_core::common::{FileName, SourceMap};
use swc_core::ecma::parser::parse_file_as_program;
use swc_core::ecma::parser::{Syntax, TsConfig};
use swc_core::ecma::visit::FoldWith;
use swc_core::ecma::visit::VisitMutWith;

use crate::extract_visitor::ExtractVisitor;
use crate::setup_handler::setup_handler;

pub struct ExtractOptions {
    pub source: String,
    pub filename: FileName,
}

impl ExtractOptions {
    pub fn new(source: String, filename: String) -> Self {
        Self {
            source,
            filename: FileName::Real(filename.into()),
        }
    }
}

pub fn extract(opts: ExtractOptions) -> Result<ExtractVisitor, Error> {
    let source_map = Lrc::<SourceMap>::default();

    let mut visitor = ExtractVisitor::new();
    let fm = source_map.new_source_file(opts.filename.clone(), opts.source);

    setup_handler(source_map.clone(), |_handler, wr| {
        let mut errors = vec![];

        let program = parse_file_as_program(
            &*fm,
            Syntax::Typescript(TsConfig {
                tsx: true,
                ..Default::default()
            }),
            Default::default(),
            None,
            &mut errors,
        );
        match program {
            Ok(program) => {
                let mut program = program.fold_with(&mut get_folder());
                program.visit_mut_with(&mut visitor);
            }
            Err(e) => return Err(Error::msg(format!(" {:?}", e)).context("Failed to parse file")),
        }
        visitor.err_msg = wr.get_display_str();
        dbg!(&visitor.data);
        Ok(visitor)
    })
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
        source.push_str(r#"t({ id: "t.fn.obj.arg", message: "Refresh inbox" });"#);
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
        source.push_str("t(true);");

        let res = extract(ExtractOptions::new(source, "test.tsx".to_string()))
            .expect("failed to extract");
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
        insert("t.fn.obj.arg", "Refresh inbox");
        insert("hello {name2}", "");
        insert("msg_id1", "hello {name2}");
        insert("msg_id2", "hello {name2}");
        insert("msg_id3", "hello {name2}");
        insert("Welcome to <0>Next.js!</0> {counter}", "");
        assert_eq!(res.data.len(), map.len());
        assert_eq!(res.data, map);
    }
}
