mod option;

use crate::auto_namespace::option::AutoNamespaceOption;
use anyhow::Error;
use swc_core::common::comments::SingleThreadedComments;
use swc_core::common::sync::Lrc;
use swc_core::common::{FileName, SourceMap};
use swc_core::ecma::ast::EsVersion::EsNext;
use swc_core::ecma::parser::lexer::Lexer;
use swc_core::ecma::parser::{Parser, StringInput, Syntax, TsConfig};
use swc_core::ecma::visit::VisitMutWith;
use swc_ecma_codegen::text_writer::JsWriter;
use swc_ecma_codegen::Emitter;

/// 自动给 t 、 Trans 调用加上 namespace 前缀
pub fn auto_namespace(opts: AutoNamespaceOption) -> Result<String, Error> {
    let cm = Lrc::<SourceMap>::default();
    let source_file = cm.new_source_file(FileName::Anon, opts.source.clone());
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

    module.visit_mut_with(&mut opts.clone());

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

#[cfg(test)]
mod tests {
    use super::*;

    fn run_test(source: &str, expected: &str) {
        let code = auto_namespace(AutoNamespaceOption {
            source: source.to_string(),
            namespace: "menu".to_string(),

            ..Default::default()
        })
        .unwrap();
        let code = code.trim_end_matches("\n");

        assert_eq!(code, expected);
    }

    #[test]
    fn t_fn_simple() {
        // 模版字符串
        run_test("t`msg3`;", "t`menu.msg3`;");
        run_test(
            "t(`msg4`, { count: 1 });",
            "t(`menu.msg4`, {\n    count: 1\n});",
        );

        // 不需要转换
        run_test(
            "t('common.msg4', { count: 1 });",
            "t('common.msg4', {\n    count: 1\n});",
        );
        run_test("t`common.msg5`;", "t`common.msg5`;");

        // 不支持的转换
        run_test("t(id);", "t(id);");
        run_test("t(id, { count: 1 });", "t(id, {\n    count: 1\n});");
    }

    #[test]
    fn trans_simple() {
        run_test("<Trans id='msg1' />;", r#"<Trans id="menu.msg1"/>;"#);
        run_test(
            "<Trans id='msg1'>children</Trans>;",
            r#"<Trans id="menu.msg1">children</Trans>;"#,
        );
        run_test("<Trans id={'msg1'} />;", r#"<Trans id="menu.msg1"/>;"#);
        // 不支持的转换
        run_test("<Trans id={`${id}`} />;", "<Trans id={`${id}`}/>;")
    }
}
