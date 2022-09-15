use swc_core::ecma::ast::{
    Ident, JSXAttrName, JSXAttrOrSpread, JSXElement, JSXElementName, JSXExpr,
};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::visit::VisitMut;
use swc_ecma_utils::swc_ecma_ast::JSXElementChild;
use tracing::error;

use crate::shared::Normalizer;

static TRANS_COMMENT_NAME: &str = "Trans";
pub struct TransVisitor;

impl VisitMut for TransVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    fn visit_mut_jsx_element(&mut self, n: &mut JSXElement) {
        let mut work = || -> Option<()> {
            let mut normalizer = Normalizer::new();
            let is_trans_component = normalizer.get_jsx_element_name(n)? == TRANS_COMMENT_NAME;
            if !is_trans_component {
                return None;
            }
            if n.children.len() == 0 {
                error!("Trans component must have at least one child");
                return None;
            }
            let attrs = &mut n.opening.attrs;

            n.children.iter().for_each(|mut child| match &mut child {
                JSXElementChild::JSXText(js_text) => {
                    // case normal text
                    normalizer.str_work(&js_text.raw);
                }
                JSXElementChild::JSXExprContainer(item) => {
                    if let JSXExpr::Expr(expr) = &item.expr {
                        normalizer.expr_work(*expr.clone());
                    }
                }
                JSXElementChild::JSXElement(el) => {
                    normalizer.jsx_element_work(el);
                }
                _ => {}
            });
            n.children.clear();

            let exist_id_prop = attrs.iter().any(|attr| {
                if let JSXAttrOrSpread::JSXAttr(attr) = attr {
                    if let JSXAttrName::Ident(ident) = &attr.name {
                        return ident.sym == JsWord::from("id");
                    }
                }
                false
            });
            attrs.extend_from_slice(&normalizer.to_jsx_attr(exist_id_prop));

            None
        };

        work();
    }
}
