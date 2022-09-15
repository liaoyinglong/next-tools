use log::debug;
use swc_core::ecma::ast::JSXElementName;
use swc_core::ecma::visit::VisitMut;
use swc_ecma_utils::swc_ecma_ast::JSXOpeningElement;

pub struct TransVisitor;
impl VisitMut for TransVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    fn visit_mut_jsx_opening_element(&mut self, n: &mut JSXOpeningElement) {
        let work = || -> Option<()> {
            let is_trans_component = match n.name {
                JSXElementName::Ident(ref ident) => &ident.sym == "trans",
                _ => false,
            };
            if is_trans_component {
                debug!("is trans component");
            }

            None
        };

        work();
    }
}
