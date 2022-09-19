use swc_core::ecma::ast::{
    ImportDecl, ImportNamedSpecifier, ImportSpecifier, Module, ModuleDecl, ModuleItem, Str,
};
use swc_core::ecma::utils::quote_ident;
use swc_core::ecma::visit::VisitMut;
use swc_core::ecma::visit::VisitMutWith;

pub struct AutoImport;

impl AutoImport {
    fn create_module_decl(members: Vec<&str>, source: &str) -> ModuleItem {
        let specifiers = members
            .iter()
            .map(|s| {
                ImportSpecifier::Named(ImportNamedSpecifier {
                    span: Default::default(),
                    local: quote_ident!(s.to_string()),
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
    fn visit_mut_module(&mut self, module: &mut Module) {
        module.visit_mut_children_with(self);
        //  TODO: optimize
        // 1. find @scope/i18n ImportDeclaration
        // 2. check has t/Trans ImportSpecifier
        module.body.insert(
            0,
            Self::create_module_decl(vec!["t", "Trans"], "@scope/i18n"),
        )
    }
}
