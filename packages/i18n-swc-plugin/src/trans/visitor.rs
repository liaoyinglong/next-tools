use swc_core::ecma::ast::{JSXAttrName, JSXAttrOrSpread, JSXElement};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::visit::VisitMut;
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
            let is_trans_component = Normalizer::get_jsx_element_name(n)? == TRANS_COMMENT_NAME;
            if !is_trans_component {
                return None;
            }
            if n.children.len() == 0 {
                error!("Trans component must have at least one child");
                return None;
            }
            let attrs = &mut n.opening.attrs;

            normalizer.jsx_children_work(n.children.clone());
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
