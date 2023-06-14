use std::path::PathBuf;
use swc_core::ecma::parser::TsConfig;
use swc_core::ecma::visit::as_folder;
use swc_core::ecma::visit::Fold;
use swc_core::ecma::{parser::Syntax, transforms::testing::test_fixture};

use s_swc_plugin::semi::semi_css_omit::SemiUiImportCssOmitVisitor;
use s_swc_visitor::get_folder;
use swc_core::common::collections::AHashMap;
use swc_core::common::{chain, Mark};
use swc_core::ecma::transforms::base::resolver;

use s_swc_plugin::semi::modularize_imports::SemiUiModularizeImportsVisitor;
use testing::fixture;

fn tr() -> impl Fold {
    chain!(
        resolver(Mark::new(), Mark::new(), false),
        // Most of the transform does not care about globals so it does not need `SyntaxContext`
        as_folder(chain!(
            SemiUiImportCssOmitVisitor {},
            SemiUiModularizeImportsVisitor::new(AHashMap::default())
        ))
    )
}

//use std::env;
#[fixture("tests/fixture/**/input.js")]
fn fixture(input: PathBuf) {
    let output = input.with_file_name("output.js");

    //env::set_var("UPDATE", "1");
    test_fixture(
        Syntax::Typescript(TsConfig {
            //jsx: input.to_string_lossy().ends_with(".jsx"),
            tsx: true,
            ..Default::default()
        }),
        &|_| chain!(tr(), get_folder()),
        &input,
        &output,
        Default::default(),
    );
}
