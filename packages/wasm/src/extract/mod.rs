pub mod extract_visitor;
pub mod extracted;


use anyhow::Error;
use s_swc_visitor::get_folder;
use swc_core::common::sync::Lrc;
use swc_core::common::{FileName, SourceMap};
use swc_core::ecma::parser::parse_file_as_program;
use swc_core::ecma::parser::{Syntax, TsConfig};
use swc_core::ecma::visit::FoldWith;
use swc_core::ecma::visit::VisitMutWith;

use crate::extract::extract_visitor::ExtractVisitor;
use crate::extract::extracted::Extracted;
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

pub fn extract(opts: ExtractOptions) -> Result<Extracted, Error> {
    let source_map = Lrc::<SourceMap>::default();
    let source_file = source_map.new_source_file(opts.filename.clone(), opts.source);

    let mut visitor = ExtractVisitor::new(source_map.clone());

    setup_handler(source_map.clone(), |_handler, wr| {
        let mut errors = vec![];

        let program = parse_file_as_program(
            &*source_file,
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
        visitor.extracted.err_msg = wr.get_display_str();
        visitor.extracted.filename = opts.filename.to_string();
        dbg!(&visitor.extracted);
        Ok(visitor.extracted)
    })
}

#[cfg(test)]
mod tests {
    use swc_core::common::collections::AHashMap;

    use crate::extract::extracted::Item;

    use super::*;

    #[test]
    fn test_extract() {
        let mut map = AHashMap::default();
        let mut insert = |id: &str, message: &str, line: usize, column: usize| {
            map.insert(
                id.to_string(),
                Item {
                    id: id.into(),
                    messages: message.into(),
                    line,
                    column,
                },
            );
        };

        let mut source = String::new();
        source.push_str("t`hello ${name}`;\n");
        insert("hello {name}", "", 1, 0);

        source.push_str("t({ id: \"t.fn.obj.arg\", message: \"Refresh inbox\" });\n");
        insert("t.fn.obj.arg", "Refresh inbox", 2, 0);

        source.push_str("<Trans>hello {name2}</Trans>;\n");
        insert("hello {name2}", "", 3, 0);

        source.push_str("<Trans id='msg_id1'>hello {name2}</Trans>;\n");
        insert("msg_id1", "hello {name2}", 4, 0);

        source.push_str("<Trans id={'msg_id2'}>hello {name2}</Trans>;\n");
        insert("msg_id2", "hello {name2}", 5, 0);

        source.push_str("<Trans id={`msg_id3`}>hello {name2}</Trans>;");
        insert("msg_id3", "hello {name2}", 6, 0);

        source.push_str(
            r#"
            <Trans>
               Welcome to <a>Next.js!</a> {counter}
            </Trans>;"#,
        );
        source.push_str("\n");
        insert("Welcome to <0>Next.js!</0> {counter}", "", 7, 12);

        source.push_str("obj.title = t`设置title`;\n");
        insert("设置title", "", 10, 12);

        source.push_str("t(`{{ arg }}是模版字符串`, { arg: '参数' });\n");
        insert("{{ arg }}是模版字符串", "", 11, 0);

        // 以下无法提取
        source.push_str("t(`error_${errorCode}`);\n"); // 提取不到
        source.push_str("i18n.t('welcome');\n");
        source.push_str("t(true);\n");
        println!("source: {}", source);

        let res = extract(ExtractOptions::new(source, "test.tsx".to_string()))
            .expect("failed to extract");

        assert_eq!(res.data.len(), map.len());

        map.iter().for_each(|(k, v)| {
            let v2 = res.data.get(k);
            if v2.is_none() {
                println!("key: {} not found", k);
            }
            let v2 = v2.unwrap();
            assert_eq!(v, v2);
        });
        assert_eq!(res.filename, "test.tsx".to_string());
    }
}
