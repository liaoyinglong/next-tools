use s_swc_visitor::t_fn::TFunctionVisitor;
use s_swc_visitor::trans::TransVisitor;

use anyhow::Error;
use swc_core::common::comments::SingleThreadedComments;
use swc_core::common::sync::Lrc;
use swc_core::common::{chain, FileName, SourceMap};
use swc_core::ecma::ast::EsVersion::EsNext;
use swc_core::ecma::parser::lexer::Lexer;
use swc_core::ecma::parser::{Parser, StringInput, Syntax, TsConfig};
use swc_core::ecma::visit::VisitMutWith;
use swc_ecma_codegen::text_writer::JsWriter;
use swc_ecma_codegen::Emitter;

// TODO: 需要重构，这里的 transform 和 auto_namespace 有很多重复代码
/// 转换代码，主要提供给 doc 用
/// 用来查看转换后的代码
pub fn transform(source: String) -> Result<String, Error> {
    let cm = Lrc::<SourceMap>::default();
    let source_file = cm.new_source_file(FileName::Anon, source.clone());
    let syntax = Syntax::Typescript(TsConfig {
        tsx: true,
        ..Default::default()
    });
    let comments = SingleThreadedComments::default();

    let lexer = Lexer::new(
        syntax,
        EsNext,
        StringInput::from(&*source_file),
        Some(&comments),
    );
    let mut parser = Parser::new_from(lexer);
    let mut module = parser
        .parse_typescript_module()
        .expect("Failed to parse file");

    module.visit_mut_with(&mut chain!(TFunctionVisitor {}, TransVisitor {}));

    // 生成代码
    let code = {
        let mut buf = vec![];
        let mut emitter = Emitter {
            cfg: Default::default(),
            cm: cm.clone(),
            comments: Some(&comments),
            wr: JsWriter::new(cm, "\n", &mut buf, None),
        };
        emitter.emit_module(&module).unwrap();
        String::from_utf8(buf).unwrap()
    };
    Ok(code)
}
