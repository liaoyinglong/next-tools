use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::Prop;
use swc_core::ecma::ast::PropOrSpread;
use swc_core::ecma::ast::TaggedTpl;
use swc_core::ecma::ast::{CallExpr, KeyValueProp};
use swc_core::ecma::ast::{Expr, PropName};
use swc_core::ecma::ast::{ExprStmt, Ident};
use swc_core::ecma::ast::{ObjectLit, Tpl};
use swc_core::ecma::visit::VisitMut;
use swc_ecma_utils::ExprFactory;

use crate::TransformVisitor;

static T_FUNCTION_NAME: &str = "t";

impl VisitMut for TransformVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html

    fn visit_mut_expr_stmt(&mut self, n: &mut ExprStmt) {
        // check that the expression is a t function call
        let is_t_function_call = |ident: Option<&Ident>| match ident {
            Some(ident) => &ident.sym == T_FUNCTION_NAME,
            None => false,
        };

        match &mut *n.expr {
            Expr::TaggedTpl(tagged_tpl) => {
                if !is_t_function_call(tagged_tpl.tag.as_ident()) {
                    return;
                }

                let TaggedTpl { tpl, tag, .. } = tagged_tpl;

                // initial args vec
                let args_len = tpl.exprs.len() + tpl.quasis.len();
                let mut args = Vec::with_capacity(args_len);

                // case normal tagged template, not have variable in template,
                // and it should only have one argument
                if tpl.exprs.is_empty() {
                    if let Some(q) = tpl.quasis.get(0) {
                        args.push(q.raw.clone().as_arg())
                    }
                } else {
                    let mut msg_id = String::from("");
                    let mut msg_ids = vec![];
                    let mut props = Vec::with_capacity(tpl.exprs.len());
                    for index in 0..args_len {
                        let i = index / 2;
                        if index % 2 == 0 {
                            if let Some(q) = tpl.quasis.get_mut(i) {
                                // normal string in temple
                                msg_id.push_str(q.raw.to_string().as_str());
                            }
                        } else if let Some(e) = tpl.exprs.get_mut(i) {
                            let e = &**e;
                            // variable in temple
                            msg_id.push_str("{");

                            let key;
                            let mut should_push = true;
                            match e {
                                Expr::Ident(ident) => {
                                    key = PropName::Ident(ident.clone());
                                    msg_id.push_str(ident.sym.to_string().as_str());
                                    let ident_name = ident.sym.to_string();
                                    // if already have current name, should not add it again
                                    should_push = !msg_ids.contains(&ident_name);
                                    msg_ids.push(ident_name);
                                }
                                _ => {
                                    key = PropName::Num(i.into());
                                    msg_id.push_str(i.to_string().as_str());
                                }
                            }
                            if should_push {
                                props.push(PropOrSpread::Prop(Box::new(Prop::KeyValue(
                                    KeyValueProp {
                                        key,
                                        value: Box::new(e.clone()),
                                    },
                                ))));
                            }
                            msg_id.push_str("}");
                        }
                    }
                    // case: first arg like : Attachment {name} saved
                    args.push(msg_id.as_arg());
                    // case: second arg like : { name }
                    args.push(
                        Expr::Object(ObjectLit {
                            span: DUMMY_SP,
                            props,
                        })
                        .as_arg(),
                    );
                }
                // replace with new call expression
                n.expr = Box::new(Expr::Call(CallExpr {
                    args,
                    callee: tag.clone().as_callee(),
                    span: DUMMY_SP,
                    type_args: None,
                }));
            }
            // Expr::Call(call_expr) => {
            //     if !is_t_function_call(call_expr.callee.as_ident()) {
            //         return;
            //     }
            //
            //     // more args should ignore
            //     if call_expr.args.len() != 1 {
            //         return;
            //     }
            //     if let Expr::Tpl(tpl) = call_expr.args.first() {}
            //
            //     // if have template literal, should replace it
            //     let should_transform = call_expr.args.iter().any(|arg| match *arg.expr {
            //         Expr::Tpl(tpl) => true,
            //         _ => false,
            //     });
            //     if !should_transform {
            //         return;
            //     }
            //
            //     // replace with new call expression
            //     n.expr = Box::new(Expr::Call(CallExpr {
            //         args: call_expr.args.clone(),
            //         callee: call_expr.callee.clone().as_callee(),
            //         span: DUMMY_SP,
            //         type_args: None,
            //     }));
            // }
            _ => {}
        }
    }
}
