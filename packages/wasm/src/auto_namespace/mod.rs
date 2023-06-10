mod option;

use crate::auto_namespace::option::AutoNamespaceOption;
use anyhow::Error;
use swc_core::common::comments::{Comment, SingleThreadedComments};
use swc_core::common::sync::Lrc;
use swc_core::common::{FileName, SourceMap};
use swc_core::ecma::ast::EsVersion::EsNext;
use swc_core::ecma::parser::lexer::Lexer;
use swc_core::ecma::parser::{Parser, StringInput, Syntax, TsConfig};
use swc_core::ecma::visit::VisitMutWith;
use swc_ecma_codegen::text_writer::JsWriter;
use swc_ecma_codegen::Emitter;

/// 自动给 t 、 Trans 调用加上 namespace 前缀
pub fn auto_namespace(mut opts: AutoNamespaceOption) -> Result<String, Error> {
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

    #[test]
    fn tr() {
        let source = r#"
        export const msg = "";
        <Trans id={'msg1'} />;
        <Trans id={`msg12`} />;
        <Trans id='msg2' />;
        t`mgs3`;
        t(`msg4`, { count: 1 });
        t('msg5', { count: 1 });
        
        // 以下已经带有 namespace 无需添加
        <Trans id='common.msg2'/>;
        t('common.msg3');
        t('common.msg4', { count: 1 });
        t`common.msg5`;

        // 以下无法解析
        <Trans id={`${id}`} />;
        t(id);
        t(id, { count: 1 });
        "#;

        let code = auto_namespace(AutoNamespaceOption {
            source: source.to_string(),
            namespace: "menu".to_string(),

            ..Default::default()
        })
        .unwrap();
        println!("{}", code);

        assert_eq!(
            code,
            r##"export const msg = "";
<Trans id="menu.msg1"/>;
<Trans id="menu.msg12"/>;
<Trans id="menu.msg2"/>;
t`menu.mgs3`;
t(`menu.msg4`, {
    count: 1
});
t("menu.msg5", {
    count: 1
});
// 以下已经带有 namespace 无需添加
<Trans id='common.msg2'/>;
t('common.msg3');
t('common.msg4', {
    count: 1
});
t`common.msg5`;
// 以下无法解析
<Trans id={`${id}`}/>;
t(id);
t(id, {
    count: 1
});
"##
        )
    }
}
