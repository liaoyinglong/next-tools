use swc_core::ecma::ast::{Expr, KeyValueProp, Lit};
use swc_core::ecma::utils::quote_str;
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
                    let new_value = compile(item.value.to_string());
                    let value = Lit::Str(quote_str!(item.span, new_value));
                    n.value = Box::new(Expr::Lit(value));
                }
                _ => {}
            }
            None
        };
        work();
    }
}

fn compile(str: String) -> String {
    str
}
