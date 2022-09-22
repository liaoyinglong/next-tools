use swc_core::common::collections::AHashMap;
use swc_core::ecma::ast::{CallExpr, ExprOrSpread, Lit};
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMut};

#[derive(Debug)]
pub struct Item {
    pub id: String,
    pub defaults: String,
}

#[derive(Default)]
pub struct ExtractVisitor {
    pub data: AHashMap<String, Item>,
}

impl ExtractVisitor {
    fn transform_to_string(&mut self, item: Option<&ExprOrSpread>) -> Option<String> {
        let lit = item?.expr.clone().lit()?;
        match lit {
            Lit::Str(str) => Some(str.value.to_string()),
            Lit::Num(num) => Some(num.value.to_string()),
            _ => None,
        }
    }
}

impl VisitMut for ExtractVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    noop_visit_mut_type!();

    // case: t("msg.id", { name: "Tom" }, { defaults: "My name is {name}" })
    fn visit_mut_call_expr(&mut self, n: &mut CallExpr) {
        n.visit_mut_children_with(self);
        let mut work = || -> Option<()> {
            let ident = n.callee.as_expr()?.as_ident()?;
            if ident.sym.as_ref() != "t" {
                return None;
            }
            let arg = &n.args;

            //region 获取msg id
            let id = self.transform_to_string(arg.first())?;
            //endregion
            //region 获取msg defaults
            let defaults = self.transform_to_string(arg.get(2)).unwrap_or("".into());
            //endregion
            self.data.insert(id.clone(), Item { id, defaults });
            None
        };
        work();
    }
}
