use swc_core::ecma::visit::VisitMut;
use swc_core::ecma::visit::VisitMutWith;

pub struct I18nSourceVisitor {
    pub file_name: String,
}

impl I18nSourceVisitor {
    // 目前只会转换文件名中带上 foo.i18n.js
    fn should_transform(self) -> bool {
        self.file_name.ends_with(".i18n.js")
    }
}
impl VisitMut for I18nSourceVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
}
