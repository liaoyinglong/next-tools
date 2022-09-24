use s_swc_visitor::get_folder;
use std::path::PathBuf;
use swc_core::ecma::{
    parser::{EsConfig, Syntax},
    transforms::testing::test_fixture,
};
use testing::fixture;

//use std::env;
#[fixture("tests/fixture/**/input.js")]
fn fixture(input: PathBuf) {
    let output = input.with_file_name("output.js");
    //env::set_var("UPDATE", "1");
    test_fixture(
        Syntax::Es(EsConfig {
            //jsx: input.to_string_lossy().ends_with(".jsx"),
            jsx: true,
            ..Default::default()
        }),
        &|_| get_folder(),
        &input,
        &output,
    );
}
