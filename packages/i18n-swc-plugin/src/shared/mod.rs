use std::collections::HashSet;

use swc_core::common::DUMMY_SP;
use swc_core::ecma::ast::{
    Expr, ExprOrSpread, Ident, JSXAttr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXElement,
    JSXElementName, JSXExpr, JSXExprContainer, KeyValueProp, ObjectLit, Prop, PropName,
    PropOrSpread,
};
use swc_core::ecma::atoms::JsWord;
use swc_ecma_utils::{quote_ident, ExprFactory};
use tracing::debug;

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

    pub fn str_work(&mut self, str: &str) {
        self.msg_id.push_str(str);
    }

    pub fn expr_work(&mut self, expr: Expr) {
        self.msg_id.push_str("{");
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
        self.msg_id.push_str(&*msg_var);
        self.msg_id.push_str("}");

        self.msg_vars.insert(msg_var.clone());
    }

    pub fn get_jsx_element_name(self, element: &mut JSXElement) -> Option<&str> {
        if let JSXElementName::Ident(ident) = &element.opening.name {
            return Some(&ident.sym);
        }
        None
    }

    pub fn jsx_element_work(&mut self, element: &mut JSXElement) {
        let component = PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
            key: PropName::Num(self.expr_index.into()),
            value: Box::new(Expr::JSXElement(Box::new(element.clone()))),
        })));
        self.components.push(component);

        self.msg_id.push_str("{");
        self.msg_id.push_str(self.expr_index.to_string().as_str());
        self.msg_id.push_str("}");

        self.expr_index = self.expr_index + 1;
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

    /// 转换成jsx_attr
    pub fn to_jsx_attr(self, exist_id_prop: bool) -> Vec<JSXAttrOrSpread> {
        debug!("find msg_id: {}", self.msg_id);
        let mut attrs = vec![
            // id={msg_id} || messages={msg_id}
            JSXAttrOrSpread::JSXAttr(JSXAttr {
                span: Default::default(),
                name: JSXAttrName::Ident(quote_ident!(if exist_id_prop {
                    "messages"
                } else {
                    "id"
                })),
                value: Some(JSXAttrValue::Lit(self.msg_id.into())),
            }),
        ];
        if !self.props.is_empty() {
            attrs.push(
                // values={values}
                JSXAttrOrSpread::JSXAttr(JSXAttr {
                    span: Default::default(),
                    name: JSXAttrName::Ident(quote_ident!("values")),
                    value: Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
                        span: Default::default(),
                        expr: JSXExpr::Expr(Box::new(Expr::Object(ObjectLit {
                            span: DUMMY_SP,
                            props: self.props,
                        }))),
                    })),
                }),
            );
        }
        if !self.components.is_empty() {
            attrs.push(
                // components={{0: <div></div> }}
                JSXAttrOrSpread::JSXAttr(JSXAttr {
                    span: Default::default(),
                    name: JSXAttrName::Ident(quote_ident!("values")),
                    value: Some(JSXAttrValue::JSXExprContainer(JSXExprContainer {
                        span: Default::default(),
                        expr: JSXExpr::Expr(Box::new(Expr::Object(ObjectLit {
                            span: DUMMY_SP,
                            props: self.components,
                        }))),
                    })),
                }),
            );
        }

        attrs
    }
}
