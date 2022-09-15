use crate::t_function::visitor::TFunctionVisitor;
use crate::trans::visitor::TransVisitor;
use swc_core::common::pass::AndThen;
use swc_core::ecma::ast::Program;
use swc_core::ecma::visit::as_folder;
use swc_core::ecma::visit::FoldWith;
use swc_core::plugin::plugin_transform;
use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use swc_ecma_utils::swc_common::chain;

// static PLUGIN_NAME: &str = "i18n_swc_plugin";
mod t_function;
mod trans;

pub fn get_visitor() -> AndThen<TFunctionVisitor, TransVisitor> {
    chain!(TFunctionVisitor {}, TransVisitor {})
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
    program.fold_with(&mut as_folder(get_visitor()))
}
