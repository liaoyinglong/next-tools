use swc_core::ecma::ast::ModuleExportName;

pub fn module_export_name_to_string(name: ModuleExportName) -> String {
    match name {
        ModuleExportName::Ident(id) => id.sym.to_string(),
        ModuleExportName::Str(str) => str.value.to_string(),
    }
}
