use swc_core::ecma::ast::{
    ImportDecl, ImportNamedSpecifier, ImportSpecifier, ModuleDecl, ModuleItem, Str,
};
use swc_core::ecma::utils::{prepend_stmt, quote_ident};
use swc_core::ecma::visit::VisitMut;
use swc_core::ecma::visit::VisitMutWith;

pub struct AutoImport;

impl AutoImport {
    fn create_module_decl(members: Vec<&str>, source: &str) -> ModuleItem {
        let specifiers = members
            .iter()
            .map(|s| {
                let local = quote_ident!(s.to_string());

                ImportSpecifier::Named(ImportNamedSpecifier {
                    span: Default::default(),
                    local,
                    imported: None,
                    is_type_only: false,
                })
            })
            .collect();

        ModuleItem::ModuleDecl(ModuleDecl::Import(ImportDecl {
            span: Default::default(),
            specifiers,
            src: Str::from(source),
            type_only: false,
            asserts: None,
        }))
    }
}

impl VisitMut for AutoImport {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    fn visit_mut_module_items(&mut self, n: &mut Vec<ModuleItem>) {
        n.visit_mut_children_with(self);

        prepend_stmt(
            n,
            Self::create_module_decl(vec!["t", "Trans"], "@scope/i18n"),
        );
    }
}
