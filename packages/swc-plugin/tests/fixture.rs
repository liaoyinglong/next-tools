use std::path::PathBuf;

use swc_core::ecma::{
    parser::{EsConfig, Syntax},
    transforms::testing::test_fixture,
};
use testing::fixture;

use s_swc_plugin::get_folder;

//use std::env;
#[fixture("tests/fixture/**/input.js")]
fn fixture(input: PathBuf) {
    let output = input.with_file_name("output.js");

    let file_name = match input.to_str() {
        Some(file_name) => {
            if file_name.contains("i18n_sources") {
                return file_name.replace(".js", "i18n.js");
            }
            file_name
        }
        None => "unknown.js",
    }
    .to_string();

    //env::set_var("UPDATE", "1");

    test_fixture(
        Syntax::Es(EsConfig {
            //jsx: input.to_string_lossy().ends_with(".jsx"),
            jsx: true,
            ..Default::default()
        }),
        &|_| get_folder(file_name),
        &input,
        &output,
    );
}
