use swc_core::common::collections::AHashMap;
use swc_core::ecma::ast::{CallExpr, Lit};
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMut};

#[derive(Debug)]
pub struct Item {
    pub id: String,
    pub default_message: String,
}

#[derive(Default)]
pub struct ExtractVisitor {
    pub msgs: AHashMap<String, Item>,
}
impl VisitMut for ExtractVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    noop_visit_mut_type!();

    fn visit_mut_call_expr(&mut self, n: &mut CallExpr) {
        n.visit_mut_children_with(self);
        let work = || -> Option<()> {
            let ident = n.callee.as_expr()?.as_ident()?;
            if ident.sym.as_ref() != "t" {
                return None;
            }
            let arg = &n.args;
            let id_arg = arg.first()?.expr.as_lit()?;
            let id;
            match id_arg {
                Lit::Str(str) => {
                    id = str.raw?;
                }
                Lit::Num(num) => {
                    id = num.raw?;
                }
                _ => {}
            }
            self.msgs.insert(
                id.to_string(),
                Item {
                    id: id.to_string(),
                    default_message: "".to_string(),
                },
            );
            None
        };
        dbg!(&self.msgs);
        work();
    }
}
