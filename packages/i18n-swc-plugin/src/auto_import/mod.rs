use swc_core::ecma::visit::VisitMut;
use swc_ecma_utils::ExprFactory;
pub struct AutoImport;
impl VisitMut for AutoImport {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
}
