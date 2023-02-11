#![feature(absolute_path)]

use std::path::Path;
use std::sync::Arc;

use swc_core::common::collections::AHashMap;
use swc_core::common::SourceMap;
use swc_core::ecma::ast::{ModuleExportName, ModuleItem};
use swc_core::ecma::parser::{parse_file_as_program, Syntax, TsConfig};
use swc_core::ecma::visit::VisitMut;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMutWith};

static PROJ_ROOT: &str = "packages/swc_plugin/src";

fn main() {
    let cm = Arc::<SourceMap>::default();
    let files = vec!["@douyinfe/semi-ui/index.js"];
    let mut errors = vec![];

    let mut parse_file_get_map = |file: &str| -> Option<()> {
        //#region 收集所有的导出 和 路径
        let mut visitor = CollectImportVisitor::new();
        let p = Path::new(PROJ_ROOT).join("bin").join(file);
        let fm = cm
            .load_file(&*p)
            .expect(&*format!("failed to load file: {}", p.display()));
        let mut program = parse_file_as_program(
            &*fm,
            Syntax::Typescript(TsConfig {
                tsx: true,
                ..Default::default()
            }),
            Default::default(),
            None,
            &mut errors,
        )
        .ok()?;
        program.visit_mut_with(&mut visitor);
        //#endregion
        //#region 生成代码
        let code = visitor.imports_to_code();
        let p = Path::new(PROJ_ROOT).join("semi/semi_ui_map.rs");
        std::fs::write(&p, &code).expect(&*format!("failed to write file: {}", p.display()));
        println!("write code to {}", p.display());
        //#endregion

        None
    };

    files.iter().for_each(|file| {
        parse_file_get_map(file);
    });
}

#[allow(dead_code)]
fn get_import_source(s: &str) -> String {
    let name = s[0..1].to_lowercase() + &s[1..];
    format!("@douyinfe/semi-ui/lib/es/{}", name)
}

/// 收集所有的导出 和 路径
struct CollectImportVisitor {
    pub imports: AHashMap<String, String>,
}

impl CollectImportVisitor {
    fn new() -> Self {
        Self {
            imports: AHashMap::default(),
        }
    }

    fn imports_to_code(&mut self) -> String {
        let mut code = String::new();
        code.push_str(
            r#"
        /// this file is generated by gen_semi_ui_hashmap.rs
        /// do not modify it manually
        use swc_core::common::collections::AHashMap;
        fn get_semi_ui_map() -> AHashMap<String, String> {
            let mut map = AHashMap::new();
        "#,
        );
        self.imports.iter().for_each(|(k, v)| {
            code.push_str(&*format!("map.insert(\"{}\", \"{}\");", k, v));
        });
        code.push_str("map}");
        code
    }
}
impl VisitMut for CollectImportVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    noop_visit_mut_type!();
    fn visit_mut_module_items(&mut self, n: &mut Vec<ModuleItem>) {
        n.iter().for_each(|item| {
            let mut work = || -> Option<()> {
                let export = item.as_module_decl()?.as_export_named()?;
                // this get the source of import
                // eg: import { Button } from './button'
                // the source is './button'
                // we should fill absolute path with this source
                // eg: @douyinfe/semi-ui/lib/es/button
                let source = {
                    let temp = export.clone().src?.value.to_string();
                    let mut base = "@douyinfe/semi-ui/lib/es/".to_string();
                    if temp.starts_with("./") {
                        base.push_str(&temp[2..]);
                    } else {
                        base.push_str(&temp);
                    }
                    base
                };

                export.specifiers.iter().for_each(|specifier| {
                    let mut iter_specifiers = || -> Option<()> {
                        let named = specifier.as_named()?;
                        let name = match named.clone().exported {
                            // case: export { default as Anchor } from './anchor';
                            Some(exported) => module_export_name_to_string(exported),
                            // case: export { Anchor } from './anchor';
                            None => module_export_name_to_string(named.clone().orig),
                        };
                        self.imports.insert(name, source.clone());
                        None
                    };
                    iter_specifiers();
                });

                None
            };
            work();
        });

        n.visit_mut_children_with(self);
    }
}

fn module_export_name_to_string(name: ModuleExportName) -> String {
    match name {
        ModuleExportName::Ident(id) => id.sym.to_string(),
        ModuleExportName::Str(str) => str.value.to_string(),
    }
}
