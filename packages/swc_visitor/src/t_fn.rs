use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::ExprStmt;
use swc_core::ecma::ast::{ArrayLit, BinExpr, CallExpr, CondExpr, Ident, PropName};
use swc_core::ecma::ast::{Callee, Expr};
use swc_core::ecma::ast::{ExprOrSpread, JSXExpr, JSXExprContainer};
use swc_core::ecma::ast::{KeyValueProp, Tpl};
use swc_core::ecma::ast::{TaggedTpl, VarDeclarator};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::utils::{quote_ident, ExprFactory};
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMut};

use crate::shared::Normalizer;

pub struct TFunctionVisitor;

impl TFunctionVisitor {
    fn transform_tpl_to_args(tpl: Tpl) -> Vec<ExprOrSpread> {
        let mut normalizer = Normalizer::new();
        let args_len = tpl.exprs.len() + tpl.quasis.len();
        for index in 0..args_len {
            let i = index / 2;
            if index % 2 == 0 {
                if let Some(q) = tpl.quasis.get(i) {
                    // normal string in temple
                    normalizer.str_work(q.raw.to_string().as_str());
                }
            } else if let Some(e) = tpl.exprs.get(i) {
                let e = &**e;
                normalizer.expr_work(e.clone());
            }
        }
        normalizer.to_args()
    }

    // if ident is t function, return the call expression
    // if that can't find t function, return None
    fn resolve_t_fn_callee(ident: Option<&Ident>) -> Option<Callee> {
        let ident = ident?;
        if ident.sym == JsWord::from("t") {
            return Some(quote_ident!(ident.sym.to_string()).as_callee());
        }
        None
    }

    //
    fn tagged_tpl_to_expr(&mut self, tagged_tpl: &mut TaggedTpl) -> Option<Expr> {
        let TaggedTpl { tpl, tag, .. } = tagged_tpl;
        let callee = Self::resolve_t_fn_callee(tag.as_ident())?;
        // initial args vec
        let mut args = vec![];
        if !(tpl.exprs.is_empty()) {
            args = Self::transform_tpl_to_args(tpl.clone());
        } else if let Some(q) = tpl.quasis.get(0) {
            // case normal tagged template, not have variable in template,
            // and it should only have one argument
            args.push(q.raw.clone().as_arg())
        }

        Some(Expr::Call(CallExpr {
            args,
            callee,
            span: DUMMY_SP,
            type_args: None,
        }))
    }

    fn handle_expr(&mut self, expr: &mut Expr) {
        match expr {
            Expr::TaggedTpl(tagged_tpl) => {
                if let Some(new_expr) = self.tagged_tpl_to_expr(tagged_tpl) {
                    *expr = new_expr
                }
            }
            _ => {}
        }
    }
}

impl VisitMut for TFunctionVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    noop_visit_mut_type!();

    // case: t`hello ${name}`
    fn visit_mut_expr_stmt(&mut self, n: &mut ExprStmt) {
        n.visit_mut_children_with(self);
        self.handle_expr(&mut n.expr);
    }

    // case: <div>{t`hello ${name}`}</div>;
    fn visit_mut_jsx_expr_container(&mut self, n: &mut JSXExprContainer) {
        n.visit_mut_children_with(self);
        match &mut n.expr {
            JSXExpr::Expr(expr) => {
                let e = &mut **expr;
                self.handle_expr(e);
            }
            _ => {}
        }
    }

    // case: var a = t`hello ${name}`;
    fn visit_mut_var_declarator(&mut self, n: &mut VarDeclarator) {
        n.visit_mut_children_with(self);
        if let Some(init) = &mut n.init {
            self.handle_expr(&mut *init);
        }
    }
    // case: var a = {b: t`hello ${name}`};
    // case: var obj = { [t`hello ${name}`]:'string' };
    fn visit_mut_key_value_prop(&mut self, n: &mut KeyValueProp) {
        n.visit_mut_children_with(self);
        self.handle_expr(&mut n.value);
        match &mut n.key {
            PropName::Computed(t) => {
                self.handle_expr(&mut *t.expr);
            }
            _ => {}
        }
    }

    // case: var arr = [t`hello ${name}`];
    fn visit_mut_array_lit(&mut self, n: &mut ArrayLit) {
        n.visit_mut_children_with(self);
        for expr in n.elems.iter_mut() {
            if let Some(expr) = expr {
                self.handle_expr(&mut expr.expr);
            }
        }
    }

    // case: Math.random() ? t`hello ${name}` : t`hello ${name2}`
    fn visit_mut_cond_expr(&mut self, n: &mut CondExpr) {
        n.visit_mut_children_with(self);
        self.handle_expr(&mut n.test);
        self.handle_expr(&mut n.cons);
        self.handle_expr(&mut n.alt);
    }

    //case: Math.random() && t`hello ${name}`;
    fn visit_mut_bin_expr(&mut self, n: &mut BinExpr) {
        n.visit_mut_children_with(self);
        self.handle_expr(&mut n.left);
        self.handle_expr(&mut n.right);
    }

    // case: console.log(t`hello ${name}`);
    fn visit_mut_call_expr(&mut self, n: &mut CallExpr) {
        n.visit_mut_children_with(self);
        n.args.iter_mut().for_each(|arg| {
            self.handle_expr(&mut arg.expr);
        });
    }
}
