use regex::Regex;
use swc_core::common::sync::Lazy;
use swc_core::ecma::ast::{Expr, KeyValueProp, Lit};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::visit::VisitMut;
use swc_core::ecma::visit::VisitMutWith;
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
                    n.value = Box::new(compile(item.value.clone())?);
                }
                _ => {}
            }
            None
        };
        work();
    }
}

static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"\{\w+}").unwrap());

fn compile(str: JsWord) -> Option<Expr> {
    let str = str.to_string();

    let mut res = vec![];
    let mut left_index = 0;

    RE.captures_iter(&str).for_each(|item| {
        if let Some(item) = item.get(0) {
            let outer = item.as_str();
            if let Some(index) = str.find(outer) {
                res.push(&str[left_index..index]);
                res.push(outer);
                left_index = index + outer.len();
            }
        }
    });
    dbg!(res);
    None
}

#[cfg(test)]
mod tests {
    use swc_core::ecma::atoms::JsWord;

    use crate::visitors::i18n_source::compile;

    #[test]
    fn compile_test() {
        assert_eq!(
            compile(JsWord::from("hello {name}, welcome to {city}")),
            None
        );
    }
}
