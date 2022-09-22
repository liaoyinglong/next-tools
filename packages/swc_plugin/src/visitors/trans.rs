use crate::shared::Normalizer;
use swc_core::ecma::ast::{JSXAttrName, JSXAttrOrSpread, JSXElement, JSXElementName};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMut};
use tracing::error;

pub struct TransVisitor;

impl TransVisitor {
    fn is_trans_component(element: &mut JSXElement) -> bool {
        if let JSXElementName::Ident(ident) = &element.opening.name {
            if ident.sym == JsWord::from("Trans") {
                // re-create new ident to make same syntaxContext
                // element.opening.name = JSXElementName::Ident(quote_ident!(ident.sym.to_string()));
                return true;
            }
        }
        false
    }
}

impl VisitMut for TransVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    noop_visit_mut_type!();

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
