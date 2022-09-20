use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::ExprOrSpread;
use swc_core::ecma::ast::ExprStmt;
use swc_core::ecma::ast::TaggedTpl;
use swc_core::ecma::ast::Tpl;
use swc_core::ecma::ast::{CallExpr, Ident};
use swc_core::ecma::ast::{Callee, Expr};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::utils::{quote_ident, ExprFactory};
use swc_core::ecma::visit::VisitMut;
use swc_core::ecma::visit::VisitMutWith;

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
    fn create_new_callee(ident: Option<&Ident>) -> Option<Callee> {
        let ident = ident?;
        if ident.sym == JsWord::from("t") {
            return Some(quote_ident!(ident.sym.to_string()).as_callee());
        }
        None
    }
}

impl VisitMut for TFunctionVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html

    fn visit_mut_expr_stmt(&mut self, n: &mut ExprStmt) {
        n.visit_mut_children_with(self);

        let mut work = || -> Option<()> {
            match &mut *n.expr {
                Expr::TaggedTpl(tagged_tpl) => {
                    let TaggedTpl { tpl, tag, .. } = tagged_tpl;
                    let callee = Self::create_new_callee(tag.as_ident())?;
                    // initial args vec
                    let mut args = vec![];
                    if !(tpl.exprs.is_empty()) {
                        args = Self::transform_tpl_to_args(tpl.clone());
                    } else if let Some(q) = tpl.quasis.get(0) {
                        // case normal tagged template, not have variable in template,
                        // and it should only have one argument
                        args.push(q.raw.clone().as_arg())
                    }
                    // replace with new call expression
                    n.expr = Box::new(Expr::Call(CallExpr {
                        args,
                        callee,
                        span: DUMMY_SP,
                        type_args: None,
                    }));
                }
                Expr::Call(call_expr) => {
                    let callee_ident = call_expr.callee.as_expr()?.as_ident();
                    call_expr.callee = Self::create_new_callee(callee_ident)?;

                    let tpl = call_expr.args.first()?.expr.clone().tpl()?;
                    // more args should ignore
                    if tpl.exprs.is_empty() || call_expr.args.len() != 1 {
                        return None;
                    }
                    let args = &mut Self::transform_tpl_to_args(tpl.clone());
                    // clear old args with new args
                    call_expr.args.clear();
                    call_expr.args.append(args);
                }
                _ => {}
            }
            None
        };
        work();
    }
}
