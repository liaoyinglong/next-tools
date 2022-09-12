use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::ExprStmt;
use swc_core::ecma::ast::ObjectLit;
use swc_core::ecma::ast::Program;
use swc_core::ecma::ast::Prop;
use swc_core::ecma::ast::PropOrSpread;
use swc_core::ecma::ast::TaggedTpl;
use swc_core::ecma::ast::{CallExpr, KeyValueProp};
use swc_core::ecma::ast::{Expr, PropName};
use swc_core::ecma::visit::as_folder;
use swc_core::ecma::visit::FoldWith;
use swc_core::ecma::visit::VisitMut;
use swc_core::plugin::plugin_transform;
use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use swc_ecma_utils::ExprFactory;
// static PLUGIN_NAME: &str = "i18n_swc_plugin";
static T_FUNCTION_NAME: &str = "t";

pub struct TransformVisitor;

impl VisitMut for TransformVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html

    fn visit_mut_expr_stmt(&mut self, n: &mut ExprStmt) {
        if let Expr::TaggedTpl(tagged_tpl) = &mut *n.expr {
            if let Some(ident) = tagged_tpl.tag.as_ident() {
                if &ident.sym != T_FUNCTION_NAME {
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
                    let mut first_arg = String::from("");
                    let mut props = Vec::with_capacity(tpl.exprs.len());
                    let mut propstrs = vec![];
                    for index in 0..args_len {
                        let i = index / 2;
                        if index % 2 == 0 {
                            if let Some(q) = tpl.quasis.get_mut(i) {
                                // normal string in temple
                                first_arg.push_str(q.raw.to_string().as_str());
                            }
                        } else if let Some(e) = tpl.exprs.get_mut(i) {
                            let e = &**e;
                            // variable in temple
                            first_arg.push_str("{");
                            match e {
                                Expr::Ident(ident) => {
                                    first_arg.push_str(ident.sym.to_string().as_str());
                                    let ident_name = ident.sym.to_string();
                                    // if already have current name, should not add it again
                                    if !propstrs.contains(&ident_name) {
                                        propstrs.push(ident_name);
                                        props.push(PropOrSpread::Prop(Box::new(Prop::Shorthand(
                                            ident.clone(),
                                        ))));
                                    }
                                }
                                Expr::Member(member) => {
                                    first_arg.push_str(i.to_string().as_str());
                                    props.push(PropOrSpread::Prop(Box::new(Prop::KeyValue(
                                        KeyValueProp {
                                            key: PropName::Num(i.into()),
                                            value: Box::new(member.clone().into()),
                                        },
                                    ))));
                                }
                                _ => {}
                            }
                            first_arg.push_str("}");
                        }
                    }
                    // case: first arg like : Attachment {name} saved
                    args.push(first_arg.as_arg());
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
        }
    }
}

/// An example plugin function with macro support.
/// `plugin_transform` macro interop pointers into deserialized structs, as well
/// as returning ptr back to host.
///
/// It is possible to opt out from macro by writing transform fn manually
/// if plugin need to handle low-level ptr directly via
/// `__transform_plugin_process_impl(
///     ast_ptr: *const u8, ast_ptr_len: i32,
///     unresolved_mark: u32, should_enable_comments_proxy: i32) ->
///     i32 /*  0 for success, fail otherwise.
///             Note this is only for internal pointer interop result,
///             not actual transform result */`
///
/// This requires manual handling of serialization / deserialization from ptrs.
/// Refer swc_plugin_macro to see how does it work internally.
#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    program.fold_with(&mut as_folder(TransformVisitor))
}
