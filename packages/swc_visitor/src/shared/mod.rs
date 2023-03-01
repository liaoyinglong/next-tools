use std::collections::HashSet;

use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::{
    Expr, ExprOrSpread, JSXAttr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXElement,
    JSXElementChild, JSXExpr, JSXExprContainer, KeyValueProp, ObjectLit, Prop, PropName,
    PropOrSpread,
};
use swc_core::ecma::utils::{quote_ident, ExprFactory};
use tracing::debug;

macro_rules! jsx_attr {
    ($name:expr, $value:expr) => {
        JSXAttrOrSpread::JSXAttr(JSXAttr {
            span: Default::default(),
            name: JSXAttrName::Ident(quote_ident!($name)),
            value: Some($value),
        })
    };
}

macro_rules! jsx_attr_object {
    ($name:expr, $value:expr) => {
        jsx_attr!(
            $name,
            JSXAttrValue::JSXExprContainer(JSXExprContainer {
                span: Default::default(),
                expr: JSXExpr::Expr(Box::new(Expr::Object(ObjectLit {
                    span: DUMMY_SP,
                    props: $value,
                }))),
            })
        )
    };
}

#[derive(Default)]
pub struct Normalizer {
    pub msg_id: String,
    msg_vars: HashSet<String>,
    props: Vec<PropOrSpread>,
    components: Vec<PropOrSpread>,
    expr_index: usize,
}

impl Normalizer {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }
}

impl Normalizer {
    pub fn str_work(&mut self, str: &str) {
        self.msg_id.push_str(str);
    }

    pub fn expr_work(&mut self, expr: Expr) {
        let key;
        let msg_var;
        match expr.clone() {
            Expr::Ident(ident) => {
                key = PropName::Ident(ident.clone());
                msg_var = ident.sym.to_string();
            }
            _ => {
                key = PropName::Num(self.expr_index.into());
                msg_var = self.expr_index.to_string();
                self.expr_index = self.expr_index + 1;
            }
        }
        if !self.msg_vars.contains(&*msg_var) {
            let prop = PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                key,
                value: Box::new(expr),
            })));
            self.props.push(prop);
        }

        self.str_work("{");
        self.str_work(&*msg_var);
        self.str_work("}");

        self.msg_vars.insert(msg_var.clone());
    }

    fn jsx_element_work(&mut self, element: JSXElement) {
        let component = PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
            key: PropName::Num(self.expr_index.into()),
            value: Box::new(Expr::JSXElement(Box::new(element.clone()))),
        })));
        self.components.push(component);

        let current = self.expr_index;
        self.expr_index = self.expr_index + 1;

        // not have children
        if element.children.is_empty() {
            self.str_work(&*format!("<{}/>", current));
        } else {
            self.str_work(&*format!("<{}>", current));
            self.jsx_children_work(element.children);
            self.str_work(&*format!("</{}>", current));
        }
    }

    pub fn jsx_children_work(&mut self, children: Vec<JSXElementChild>) {
        children.iter().for_each(|mut child| match &mut child {
            JSXElementChild::JSXText(js_text) => {
                let str = {
                    let start_with_white_space = js_text.raw.starts_with(" ");
                    let end_with_white_space = js_text.raw.ends_with(" ");
                    let mut s = js_text.raw.trim().to_string();
                    // case: jsx_text = " "
                    if s.is_empty() {
                        s = " ".to_string();
                    } else {
                        // should keep whitespace at start and end
                        if start_with_white_space {
                            s.insert_str(0, " ");
                        }
                        if end_with_white_space {
                            s.push_str(" ");
                        }
                    }
                    s
                };
                // case normal text
                self.str_work(str.as_str());
            }
            JSXElementChild::JSXExprContainer(item) => {
                if let JSXExpr::Expr(expr) = &item.expr {
                    self.expr_work(*expr.clone());
                }
            }
            JSXElementChild::JSXElement(el) => {
                self.jsx_element_work(*el.clone());
            }
            _ => {}
        })
    }

    /// case: first arg like : Attachment {name} saved
    /// case: second arg like : { name }
    pub fn to_args(self) -> Vec<ExprOrSpread> {
        debug!("t function msg_id: {}", self.msg_id);
        vec![
            self.msg_id.as_arg(),
            Expr::Object(ObjectLit {
                span: DUMMY_SP,
                props: self.props,
            })
            .as_arg(),
        ]
    }

    /// 转换成jsx_attr
    pub fn to_jsx_attr(self, exist_id_prop: bool) -> Vec<JSXAttrOrSpread> {
        debug!("trans component msg_id: {}", self.msg_id);

        let mut attrs = vec![
            // id={"msg_id"} || message={"msg_id"}
            jsx_attr!(
                if exist_id_prop { "message" } else { "id" },
                JSXAttrValue::Lit(self.msg_id.trim().into())
            ),
        ];
        if !self.props.is_empty() {
            // values={values}
            attrs.push(jsx_attr_object!("values", self.props));
        }
        if !self.components.is_empty() {
            // components={{0: <div></div> }}
            attrs.push(jsx_attr_object!("components", self.components));
        }

        attrs
    }
}
