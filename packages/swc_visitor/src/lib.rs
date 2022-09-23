pub mod i18n_source;
mod shared;
pub mod t_fn;
pub mod trans;

use swc_core::common::chain;
use swc_core::ecma::visit::as_folder;
use swc_core::ecma::visit::Fold;

use crate::{i18n_source::I18nSourceVisitor, t_fn::TFunctionVisitor, trans::TransVisitor};

pub fn get_folder(file_name: String) -> impl Fold {
    as_folder(chain!(
        TFunctionVisitor {},
        TransVisitor {},
        I18nSourceVisitor { file_name }
    ))
}
