use swc_core::ecma::ast::{Lit, ModuleDecl, ModuleItem, Stmt};
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMut};
use tracing::debug;
pub struct SemiUiImportCssVisitor;

impl SemiUiImportCssVisitor {
    // 返回 true 保留当前节点，返回 false 删除当前节点
    pub fn handle_require_fn(stmt: &Stmt) -> Option<bool> {
        let call_expr = stmt.as_expr()?.expr.as_call()?;
        let callee = call_expr.callee.as_expr()?.as_ident()?;
        if callee.sym == *"require" {
            let first_arg = call_expr.args.get(0)?;
            let lit = first_arg.expr.as_lit()?;
            return Some(match lit {
                Lit::Str(str) => !str.value.to_string().ends_with(".css"),
                _ => true,
            });
        }

        None
    }
}

impl VisitMut for SemiUiImportCssVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    noop_visit_mut_type!();

    fn visit_mut_module_items(&mut self, n: &mut Vec<ModuleItem>) {
        let new_items: Vec<_> = n
            .drain(..)
            .filter(|x| match x {
                // find require('*.css') statements
                ModuleItem::Stmt(stmt) => Self::handle_require_fn(stmt).unwrap_or(true),
                // find import decl
                ModuleItem::ModuleDecl(decl) => match decl {
                    ModuleDecl::Import(decl) => {
                        // import x from 'xx' 保留
                        // import 'xx.css' 删除
                        debug!("import src: {}", decl.src.value);
                        !decl.src.value.ends_with(".css")
                    }
                    _ => true,
                },
            })
            .collect();

        *n = new_items;

        n.visit_mut_children_with(self);
    }
}
