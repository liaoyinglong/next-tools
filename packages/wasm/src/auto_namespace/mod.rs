use anyhow::Error;
use swc_core::common::sync::Lrc;
use swc_core::common::{FileName, SourceMap};
use swc_core::ecma::ast::EsVersion::EsNext;
use swc_core::ecma::parser::lexer::Lexer;
use swc_core::ecma::parser::{Parser, StringInput, Syntax, TsConfig};
use swc_core::ecma::visit::VisitMutWith;
use swc_ecma_codegen::text_writer::JsWriter;
use swc_ecma_codegen::Emitter;

pub struct AutoNamespaceOption {
    /// 源代码
    pub source: String,
    /// 翻译key的前缀
    pub namespace: String,
    /// 用于分割 namespace 和 key 的字符串
    pub separator: String,
}

/// 自动给 t 、 Trans 调用加上 namespace 前缀
pub fn auto_namespace(opts: AutoNamespaceOption) -> Result<String, Error> {
    let cm = Lrc::<SourceMap>::default();
    let source_file = cm.new_source_file(FileName::Anon, opts.source);
    let syntax = Syntax::Typescript(TsConfig {
        tsx: true,
        ..Default::default()
    });
    let lexer = Lexer::new(syntax, EsNext, StringInput::from(&*source_file), None);
    let mut parser = Parser::new_from(lexer);
    let module = parser
        .parse_typescript_module()
        .expect("Failed to parse file");

    // 生成代码
    let code = {
        let mut buf = vec![];
        let mut emitter = Emitter {
            cfg: Default::default(),
            cm: cm.clone(),
            comments: None,
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
        <Trans id={'msg'} />;
        t`mgs`;
        t(`msg`, { count: 1 });
        t('msg', { count: 1 });
        "#;

        let code = auto_namespace(AutoNamespaceOption {
            source: source.to_string(),
            namespace: "menu".to_string(),
            separator: ".".to_string(),
        })
        .unwrap();
        println!("{}", code);
    }
}
