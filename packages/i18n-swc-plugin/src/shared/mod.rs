use swc_core::ecma::ast::{Expr, KeyValueProp, Prop, PropName, PropOrSpread};

// get such as  `{name}`/`{0}`
pub fn normalize_expr(expr: Expr, index: usize) -> (String, PropOrSpread) {
    let mut msg_var = String::from("{");
    let key;
    match expr {
        Expr::Ident(ref ident) => {
            key = PropName::Ident(ident.clone());
            msg_var.push_str(ident.sym.to_string().as_str());
        }
        _ => {
            key = PropName::Num(index.into());
            msg_var.push_str(&*index.to_string());
        }
    }
    let prop = PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
        key,
        value: Box::new(expr.clone()),
    })));

    msg_var.push_str("}");
    (msg_var, prop)
}
