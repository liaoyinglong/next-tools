use swc_core::{
    common::DUMMY_SP,
    ecma::{
        ast::{CallExpr, Expr, ExprStmt, Program},
        visit::{as_folder, FoldWith, VisitMut},
    },
    plugin::{plugin_transform, proxies::TransformPluginProgramMetadata},
};
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
                let args = tagged_tpl
                    .tpl
                    .quasis
                    .iter()
                    .map(|quasi| quasi.raw.clone().as_arg())
                    .collect();

                n.expr = Box::new(Expr::Call(CallExpr {
                    args,
                    callee: tagged_tpl.tag.clone().as_callee(),
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
