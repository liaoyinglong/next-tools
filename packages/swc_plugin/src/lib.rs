#![feature(drain_filter)]

pub mod semi;
pub mod shared;

use crate::semi::modularize_imports::SemiUiModularizeImportsVisitor;
use crate::semi::semi_css_omit::SemiUiImportCssOmitVisitor;
use crate::shared::PluginConfig;
use s_swc_visitor::get_folder;
use swc_core::ecma::ast::Program;
use swc_core::ecma::visit::FoldWith;
use swc_core::ecma::visit::VisitMutWith;
use swc_core::plugin::metadata::TransformPluginMetadataContextKind;
use swc_core::plugin::plugin_transform;
use swc_core::plugin::proxies::TransformPluginProgramMetadata;

// static PLUGIN_NAME: &str = "i18n_swc_plugin";

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
pub fn process_transform(
    mut program: Program,
    metadata: TransformPluginProgramMetadata,
) -> Program {
    let file_name = metadata
        .get_context(&TransformPluginMetadataContextKind::Filename)
        .unwrap_or("unknown file_name".to_string());
    //#region config setup
    let config_str = &metadata
        .get_transform_plugin_config()
        .expect("failed to get plugin config for transform-imports");
    let config = serde_json::from_str::<PluginConfig>(config_str).unwrap_or_default();
    //#endregion

    if config.enable_semi_css_omit {
        if file_name.contains("@douyinfe/semi") {
            program.visit_mut_with(&mut SemiUiImportCssOmitVisitor {});
        }
    }
    if config.enable_semi_modularize_import {
        let mut visitor = SemiUiModularizeImportsVisitor::new(config.extra_semi_import_map);
        program.visit_mut_with(&mut visitor);
    }

    // FIXME: only transform expected files now, should make it configurable
    let should_transform = file_name.contains("@dune2/") || !file_name.contains("node_modules");

    if should_transform {
        // println!("swc plugin: should_transform, {}", file_name);
        program.fold_with(&mut get_folder())
    } else {
        // println!("swc plugin: skip, {}", file_name);
        program
    }
}
