use crate::semi::semi_ui_map::get_semi_ui_map;
use crate::semi::SemiImportMap;
use swc_core::ecma::ast::{
    ImportDecl, ImportDefaultSpecifier, ImportNamedSpecifier, ImportSpecifier, ModuleDecl,
    ModuleItem, Str,
};
use swc_core::ecma::{visit::noop_visit_mut_type, visit::VisitMut, visit::VisitMutWith};

use crate::shared::module_export_name_to_string;

use super::SemiImportItem;

/// 用来重定向 semi ui 的桶导出
pub struct SemiUiModularizeImportsVisitor {
    // 用来存储 @douyinfe/semi-ui 的导入语句
    imports: Vec<ModuleItem>,
    pkgs: Vec<String>,
    import_map: SemiImportMap,
}

impl SemiUiModularizeImportsVisitor {
    pub fn new(extra_semi_import_map: SemiImportMap) -> Self {
        // 内置的 semi-ui 的导入映射
        let mut builtin_import_map = get_semi_ui_map();
        builtin_import_map.extend(extra_semi_import_map);
        Self {
            imports: Vec::default(),
            pkgs: vec![
                "@douyinfe/semi-ui".to_string(),
                "@douyinfe/semi-icons".to_string(),
            ],
            import_map: builtin_import_map,
        }
    }

    /// 找到了 @douyinfe/semi-ui 的 import 语句
    /// 将存起来导入了哪些，以及导入的名字是什么。并且删除这个 import 语句
    /// 例如：
    /// import { Button , Input as SemiInput } from '@douyinfe/semi-ui'
    /// 会存储 Button -> Button, SemiInput -> Input
    fn collect_imports(&mut self, item: ModuleItem) -> Option<bool> {
        let module_decl = item.as_module_decl()?;
        let import_decl = module_decl.as_import()?;
        // 只处理 semi 相关的导入语句
        if !self.pkgs.contains(&import_decl.src.value.to_string()) {
            return None;
        }

        for specifier in import_decl.specifiers.iter() {
            // 这里理论上不会抛出错误
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

            // 根据收集的imports重新生成 @douyinfe/semi-ui 的导入语句
            // 例如：
            // ```js
            // import Input from "@douyinfe/semi-ui/lib/es/input";
            // import SemiUiSpace from "@douyinfe/semi-ui/lib/es/space";
            // ```
            let default_semi_import_item = SemiImportItem::default();
            let SemiImportItem {
                path: import_path,
                is_named_import,
            } = self
                .import_map
                .get(&*imported_var)
                .unwrap_or(&default_semi_import_item);

            if !import_path.is_empty() {
                let p = ImportDecl {
                    span: import_decl.span,
                    src: Box::new(Str {
                        span: Default::default(),
                        value: import_path.to_string().into(),
                        raw: None,
                    }),
                    specifiers: vec![{
                        if *is_named_import {
                            ImportSpecifier::Named(ImportNamedSpecifier {
                                span: import_specifier.local.span,
                                local: import_specifier.local.clone(),
                                imported: import_specifier.imported.clone(),
                                is_type_only: false,
                            })
                        } else {
                            ImportSpecifier::Default(ImportDefaultSpecifier {
                                span: import_specifier.local.span,
                                local: import_specifier.local.clone(),
                            })
                        }
                    }],
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
