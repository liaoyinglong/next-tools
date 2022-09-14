use std::path::PathBuf;
use swc_core::ecma::{
    parser::{EsConfig, Syntax},
    transforms::testing::test_fixture,
    visit::as_folder,
};

use i18n_swc_plugin::TransformVisitor;
use testing::fixture;

//use std::env;
#[fixture("tests/fixture/**/code.js")]
fn fixture(input: PathBuf) {
    env_logger::init();

    let output = input.with_file_name("output.js");

    //env::set_var("UPDATE", "1");

    test_fixture(
        Syntax::Es(EsConfig {
            //jsx: input.to_string_lossy().ends_with(".jsx"),
            jsx: true,
            ..Default::default()
        }),
        &|_| as_folder(TransformVisitor),
        &input,
        &output,
    );
}
