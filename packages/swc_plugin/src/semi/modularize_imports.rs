use crate::semi::semi_ui_map::get_semi_ui_map;
use swc_core::common::collections::AHashMap;
use swc_core::ecma::ast::{
    ImportDecl, ImportDefaultSpecifier, ImportSpecifier, ModuleDecl, ModuleItem, Str,
};
use swc_core::ecma::utils::quote_ident;
use swc_core::ecma::{visit::noop_visit_mut_type, visit::VisitMut, visit::VisitMutWith};

use crate::shared::module_export_name_to_string;

/// 用来重定向 semi ui 的桶导出
pub struct SemiUiModularizeImportsVisitor {
    // 用来存储 @douyinfe/semi-ui 的导入语句
    imports: Vec<ModuleItem>,
}

impl Default for SemiUiModularizeImportsVisitor {
    fn default() -> Self {
        Self {
            imports: Vec::default(),
        }
    }
}

impl SemiUiModularizeImportsVisitor {
    /// 找到了 @douyinfe/semi-ui 的 import 语句
    /// 将存起来导入了哪些，以及导入的名字是什么。并且删除这个 import 语句
    /// 例如：
    /// import { Button , Input as SemiInput } from '@douyinfe/semi-ui'
    /// 会存储 Button -> Button, SemiInput -> Input
    fn collect_imports(&mut self, item: ModuleItem) -> Option<bool> {
        let module_decl = item.as_module_decl()?;
        let import_decl = module_decl.as_import()?;
        if import_decl.src.value != *"@douyinfe/semi-ui" {
            return None;
        }
        let semi_ui_imported_map = get_semi_ui_map();
        for specifier in import_decl.specifiers.iter() {
            let import_specifier = specifier.as_named()?;
            // local_var = Button, SemiInput
            let local_var = import_specifier.local.sym.to_string();
            // imported_var = Button, Input
            let imported_var = {
                match import_specifier.imported.clone() {
                    None => local_var.clone(),
                    Some(m) => module_export_name_to_string(m),
                }
            };

            #[allow(unused_doc_comments)]
            /// 根据收集的imports重新生成 @douyinfe/semi-ui 的导入语句
            /// 例如：
            /// ```js
            /// import Input from "@douyinfe/semi-ui/lib/es/input";
            /// import SemiUiSpace from "@douyinfe/semi-ui/lib/es/space";
            /// ```
            let import_path = {
                match semi_ui_imported_map.get(&*imported_var) {
                    None => "",
                    Some(x) => x,
                }
            };
            if !import_path.is_empty() {
                let p = ImportDecl {
                    span: import_decl.span,
                    src: Box::new(Str {
                        span: Default::default(),
                        value: import_path.to_string().into(),
                        raw: None,
                    }),
                    specifiers: vec![ImportSpecifier::Default(ImportDefaultSpecifier {
                        span: import_specifier.local.span,
                        local: import_specifier.local.clone(),
                    })],
                    type_only: false,
                    asserts: None,
                };
                self.imports
                    .push(ModuleItem::ModuleDecl(ModuleDecl::Import(p)));
            }
        }
        Some(true)
    }
    /// 移除 @douyinfe/semi-ui 导入
    fn drain_import_and_collect(&mut self, n: &mut Vec<ModuleItem>) {
        n.drain_filter(|item| self.collect_imports(item.clone()).unwrap_or(false));
    }
}

impl VisitMut for SemiUiModularizeImportsVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    noop_visit_mut_type!();

    fn visit_mut_module_items(&mut self, n: &mut Vec<ModuleItem>) {
        self.drain_import_and_collect(n);
        self.imports.drain(..).for_each(|x| n.insert(0, x));
        n.visit_mut_children_with(self);
    }
}

pub fn capitalize(s: &str) -> String {
    let mut c = s.chars();
    match c.next() {
        None => String::new(),
        Some(f) => f.to_lowercase().collect::<String>() + c.as_str(),
    }
}
