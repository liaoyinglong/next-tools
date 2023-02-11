use swc_core::common::collections::AHashMap;
use swc_core::ecma::ast::{
    ImportDecl, ImportDefaultSpecifier, ImportSpecifier, ModuleDecl, ModuleExportName, ModuleItem,
    Str,
};
use swc_core::ecma::utils::quote_ident;
use swc_core::ecma::{visit::noop_visit_mut_type, visit::VisitMut, visit::VisitMutWith};

/// 用来重定向 semi ui 的桶导出
pub struct SemiUiModularizeImportsVisitor {
    imports: AHashMap<String, String>,
}

impl Default for SemiUiModularizeImportsVisitor {
    fn default() -> Self {
        Self {
            imports: AHashMap::default(),
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
        for specifier in import_decl.specifiers.iter() {
            let import_specifier = specifier.as_named()?;
            let local_var = import_specifier.local.sym.to_string();
            let mut imported_var = local_var.clone();
            if let Some(imported) = import_specifier.imported.clone() {
                match imported {
                    ModuleExportName::Ident(id) => {
                        imported_var = id.sym.to_string();
                    }
                    ModuleExportName::Str(str) => {
                        imported_var = str.value.to_string();
                    }
                }
            }
            self.imports.insert(local_var, imported_var);
        }
        Some(true)
    }
    /// 移除 @douyinfe/semi-ui 导入
    fn drain_import_and_collect(&mut self, n: &mut Vec<ModuleItem>) {
        n.drain_filter(|item| self.collect_imports(item.clone()).unwrap_or(false));
    }
    /// 根据收集的imports重新生成 @douyinfe/semi-ui 的导入语句
    /// 例如：
    /// ```js
    /// import Input from "@douyinfe/semi-ui/lib/es/input";
    /// import SemiUiSpace from "@douyinfe/semi-ui/lib/es/space";
    /// ```
    fn push_imports(&self, n: &mut Vec<ModuleItem>) {
        self.imports.iter().for_each(|(local_var, imported_var)| {
            let p = ImportDecl {
                span: Default::default(),
                src: Box::new(Str {
                    span: Default::default(),
                    value: format!("@douyinfe/semi-ui/lib/es/{}", imported_var).into(),
                    raw: None,
                }),
                specifiers: vec![ImportSpecifier::Default(ImportDefaultSpecifier {
                    span: Default::default(),
                    local: quote_ident!(local_var.clone()),
                })],
                type_only: false,
                asserts: None,
            };
            n.insert(0, ModuleItem::ModuleDecl(ModuleDecl::Import(p)));
        });
    }
}

impl VisitMut for SemiUiModularizeImportsVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    noop_visit_mut_type!();

    fn visit_mut_module_items(&mut self, n: &mut Vec<ModuleItem>) {
        self.drain_import_and_collect(n);
        dbg!(self.imports.clone());
        self.push_imports(n);
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
