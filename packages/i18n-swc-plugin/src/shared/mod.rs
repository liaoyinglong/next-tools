use std::collections::HashSet;
use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::{
    Expr, ExprOrSpread, KeyValueProp, ObjectLit, Prop, PropName, PropOrSpread,
};
use swc_ecma_utils::ExprFactory;
use tracing::debug;

#[derive(Default)]
pub struct Normalizer {
    msg_id: String,
    msg_vars: HashSet<String>,
    props: Vec<PropOrSpread>,
}

impl Normalizer {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }

    pub fn str(&mut self, str: &str) {
        self.msg_id.push_str(str);
    }

    pub fn expr(&mut self, expr: Expr, index: usize) {
        self.msg_id.push_str("{");
        let key;
        let msg_var;
        match expr.clone() {
            Expr::Ident(ident) => {
                key = PropName::Ident(ident.clone());
                msg_var = ident.sym.to_string();
            }
            _ => {
                key = PropName::Num(index.into());
                msg_var = index.to_string();
            }
        }
        if !self.msg_vars.contains(&*msg_var) {
            let prop = PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                key,
                value: Box::new(expr),
            })));
            self.props.push(prop);
        }
        self.msg_id.push_str(&*msg_var);
        self.msg_id.push_str("}");

        self.msg_vars.insert(msg_var.clone());
    }

    /// case: first arg like : Attachment {name} saved
    /// case: second arg like : { name }
    pub fn to_args(self) -> Vec<ExprOrSpread> {
        debug!("find msg_id: {}", self.msg_id);
        vec![
            self.msg_id.as_arg(),
            Expr::Object(ObjectLit {
                span: DUMMY_SP,
                props: self.props,
            })
            .as_arg(),
        ]
    }
}
