mod shared;
pub mod t_fn;
pub mod trans;

use swc_core::common::chain;
use swc_core::ecma::visit::as_folder;
use swc_core::ecma::visit::Fold;

use crate::{t_fn::TFunctionVisitor, trans::TransVisitor};

pub fn get_folder() -> impl Fold {
    as_folder(chain!(TFunctionVisitor {}, TransVisitor {},))
}
