use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::CallExpr;
use swc_core::ecma::ast::Expr;
use swc_core::ecma::ast::ExprOrSpread;
use swc_core::ecma::ast::TaggedTpl;
use swc_core::ecma::ast::Tpl;
use swc_core::ecma::ast::{ExprStmt, Ident};
use swc_core::ecma::visit::VisitMut;
use swc_ecma_utils::ExprFactory;

use crate::shared::Normalizer;

static T_FUNCTION_NAME: &str = "t";

fn transform_tpl_to_args(tpl: Tpl) -> Vec<ExprOrSpread> {
    let mut normalizer = Normalizer::new();
    let args_len = tpl.exprs.len() + tpl.quasis.len();
    for index in 0..args_len {
        let i = index / 2;
        if index % 2 == 0 {
            if let Some(q) = tpl.quasis.get(i) {
                // normal string in temple
                normalizer.str(q.raw.to_string().as_str());
            }
        } else if let Some(e) = tpl.exprs.get(i) {
            let e = &**e;
            normalizer.expr(e.clone(), i);
        }
    }
    normalizer.to_args()
}

// check that the expression is a t function call
fn is_t_function_call(ident: Option<&Ident>) -> bool {
    match ident {
        Some(ident) => &ident.sym == T_FUNCTION_NAME,
        None => false,
    }
}

pub struct TFunctionVisitor;

impl VisitMut for TFunctionVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html

    fn visit_mut_expr_stmt(&mut self, n: &mut ExprStmt) {
        let mut work = || -> Option<()> {
            match &mut *n.expr {
                Expr::TaggedTpl(tagged_tpl) if is_t_function_call(tagged_tpl.tag.as_ident()) => {
                    let TaggedTpl { tpl, tag, .. } = tagged_tpl;
                    // initial args vec
                    let mut args = vec![];
                    if !(tpl.exprs.is_empty()) {
                        args = transform_tpl_to_args(tpl.clone());
                    } else if let Some(q) = tpl.quasis.get(0) {
                        // case normal tagged template, not have variable in template,
                        // and it should only have one argument
                        args.push(q.raw.clone().as_arg())
                    }
                    // replace with new call expression
                    n.expr = Box::new(Expr::Call(CallExpr {
                        args,
                        callee: tag.clone().as_callee(),
                        span: DUMMY_SP,
                        type_args: None,
                    }));
                }
                Expr::Call(call_expr) => {
                    let callee_ident = call_expr.callee.as_expr()?.as_ident();
                    // more args should ignore
                    if !is_t_function_call(callee_ident) || call_expr.args.len() != 1 {
                        return None;
                    }
                    let tpl = call_expr.args.first()?.expr.clone().tpl()?;
                    if tpl.exprs.is_empty() {
                        return None;
                    }

                    let args = &mut transform_tpl_to_args(tpl.clone());
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
