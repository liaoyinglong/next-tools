use swc_core::ecma::ast::{JSXAttrName, JSXAttrOrSpread, JSXElement, JSXElementName};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::visit::VisitMut;
use swc_core::ecma::visit::VisitMutWith;
use tracing::error;

use crate::shared::Normalizer;

static TRANS_COMMENT_NAME: Option<&str> = Some("Trans");
pub struct TransVisitor;

impl TransVisitor {
    fn get_jsx_element_name(element: &mut JSXElement) -> Option<&str> {
        if let JSXElementName::Ident(ident) = &element.opening.name {
            return Some(&ident.sym);
        }
        None
    }
    fn is_trans_component(element: &mut JSXElement) -> bool {
        Self::get_jsx_element_name(element) == TRANS_COMMENT_NAME
    }
}

impl VisitMut for TransVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    fn visit_mut_jsx_element(&mut self, n: &mut JSXElement) {
        n.visit_mut_children_with(self);

        if !Self::is_trans_component(n) {
            return;
        }
        if n.children.len() == 0 {
            error!("Trans component must have at least one child");
            return;
        }
        let attrs = &mut n.opening.attrs;

        let mut normalizer = Normalizer::new();
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
    }
}
