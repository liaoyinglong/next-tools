use regex::Regex;
use swc_core::common::sync::Lazy;
use swc_core::ecma::ast::{ArrayLit, Expr, ExprOrSpread, KeyValueProp, Lit};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMut};
use tracing::debug;

pub struct I18nSourceVisitor {
    pub file_name: String,
}

impl I18nSourceVisitor {
    // 目前只会转换文件名中带上 foo.i18n.js
    fn should_transform(&mut self) -> bool {
        self.file_name.ends_with(".i18n.js")
    }
}
impl VisitMut for I18nSourceVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html

    noop_visit_mut_type!();

    fn visit_mut_key_value_prop(&mut self, n: &mut KeyValueProp) {
        n.visit_mut_children_with(self);
        if !self.should_transform() {
            debug!("skip i18n source transform, file name: {}", self.file_name);
            return;
        }
        let mut work = || -> Option<()> {
            let lit = n.value.as_lit()?;
            match lit {
                Lit::Str(item) => {
                    n.value = compile(item.value.clone())?;
                }
                _ => {}
            }
            None
        };
        work();
    }
}

static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"\{\w+}").unwrap());

fn compile(str: JsWord) -> Option<Box<Expr>> {
    let str = str.to_string();

    let mut elems = vec![];
    let mut left_index = 0;

    RE.captures_iter(&str).for_each(|item| {
        if let Some(item) = item.get(0) {
            let variable = item.as_str();
            if let Some(index) = str.find(variable) {
                //region 处理普通字符串
                let normal_str = &str[left_index..index];
                let normal_item = Some(ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Lit(Lit::Str(normal_str.into()))),
                });
                elems.push(normal_item);
                //endregion

                //region 处理变量
                let variable_item = Some(ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Array(ArrayLit {
                        span: Default::default(),
                        elems: vec![Some(ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Lit(Lit::Str(
                                variable.replace("{", "").replace("}", "").into(),
                            ))),
                        })],
                    })),
                });
                elems.push(variable_item);
                //endregion
                left_index = index + variable.len();
            }
        }
    });
    if elems.len() > 0 {
        Some(Box::new(Expr::Array(ArrayLit {
            span: Default::default(),
            elems,
        })))
    } else {
        None
    }
}

