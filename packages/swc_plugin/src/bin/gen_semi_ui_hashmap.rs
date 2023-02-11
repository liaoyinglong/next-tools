use std::path::Path;
use std::sync::Arc;

use swc_core::common::SourceMap;
use swc_core::ecma::parser::{parse_file_as_program, Syntax, TsConfig};

fn main() {
    let cm = Arc::<SourceMap>::default();
    let files = vec!["@douyinfe/semi-ui/index.js"];
    let mut errors = vec![];

    let mut parse_file_get_map = |file: &str| -> Option<()> {
        let p = Path::new("packages/swc_plugin/src/bin").join(file);
        let fm = cm.load_file(&*p).expect("failed to load file");
        let program = parse_file_as_program(
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
