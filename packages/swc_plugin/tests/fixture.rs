use std::path::PathBuf;
use swc_core::ecma::visit::as_folder;
use swc_core::ecma::visit::Fold;
use swc_core::ecma::{
    parser::{EsConfig, Syntax},
    transforms::testing::test_fixture,
};

use s_swc_plugin::semi::semi_css_omit::SemiUiImportCssOmitVisitor;
use s_swc_visitor::get_folder;
use swc_core::common::chain;

use s_swc_plugin::semi::modularize_imports::SemiUiModularizeImportsVisitor;
use testing::fixture;

fn get_folder2() -> impl Fold {
    as_folder(chain!(
        SemiUiImportCssOmitVisitor {},
        SemiUiModularizeImportsVisitor::default()
    ))
}

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
        &|_| chain!(get_folder(), get_folder2()),
        &input,
        &output,
        Default::default(),
    );
}
