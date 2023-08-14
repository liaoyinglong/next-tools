use std::sync::Arc;
use swc_core::common::errors::HANDLER;
use swc_core::common::sync::Lrc;
use swc_core::common::SourceMap;
use swc_core::ecma::ast::{
    CallExpr, Expr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXElementName, JSXExpr,
    JSXOpeningElement, Lit, ObjectLit, TaggedTpl,
};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMut};

use crate::extract::extracted::Extracted;

#[derive(Debug)]
pub struct Config {
    pub id: String,
    pub message: String,
    pub trans_component: String,
    pub t_fn: String,
    pub msg_fn: String,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            trans_component: "Trans".to_string(),
            t_fn: "t".to_string(),
            id: "id".to_string(),
            message: "message".to_string(),
            msg_fn: "msg".to_string(),
        }
    }
}

pub struct ExtractVisitor {
    pub extracted: Extracted,

    pub config: Config,
    pub source_map: Lrc<SourceMap>,
}

impl ExtractVisitor {
    pub fn new(source_map: Arc<SourceMap>) -> Self {
        ExtractVisitor {
            config: Config::default(),
            extracted: Default::default(),
            source_map,
        }
    }

    fn lit_to_string(&mut self, lit: Lit) -> Option<String> {
        match lit {
            Lit::Str(str) => Some(str.value.to_string()),
            Lit::Num(num) => Some(num.value.to_string()),
            _ => None,
        }
    }

    fn pick_object_value(&mut self, obj: ObjectLit, key: &str) -> Option<String> {
        let props = obj.props;
        let item = props.iter().find(|prop| {
            let f = || -> Option<String> {
                let p = prop.as_prop()?;
                let p = p.as_key_value()?;
                let k = p.key.as_ident()?.sym.to_string();
                Some(k)
            };
            match f() {
                Some(k) => k == key,
                None => false,
            }
        })?;
        let v = item.as_prop()?.as_key_value()?.value.clone();
        self.lit_to_string(v.lit()?)
    }

    fn jsx_attr_value_to_string(&mut self, value: Option<JSXAttrValue>) -> Option<String> {
        match value? {
            JSXAttrValue::Lit(lit) => self.lit_to_string(lit),
            JSXAttrValue::JSXExprContainer(container) => match container.expr {
                JSXExpr::Expr(expr) => match *expr {
                    Expr::Lit(lit) => self.lit_to_string(lit),
                    Expr::Tpl(tpl) => {
                        if tpl.exprs.is_empty() {
                            return tpl.quasis.get(0).map(|item| item.raw.to_string());
                        }
                        // case <Trans id={`msg_${name}`} />, 这种不支持
                        None
                    }
                    _ => None,
                },
                JSXExpr::JSXEmptyExpr(_) => None,
            },
            _ => None,
        }
    }
}

impl VisitMut for ExtractVisitor {
    // Implement necessary visit_mut_* methods for actual custom transform.
    // A comprehensive list of possible visitor methods can be found here:
    // https://rustdoc.swc.rs/swc_ecma_visit/trait.VisitMut.html
    noop_visit_mut_type!();

    /// 对应 t 方法调用的时候有以下：
    /// ```js
    /// t({ id: "Refresh inbox", message: "Refresh inbox" });
    /// t({ id: "Refresh inbox" }, { name: "name" });
    /// t({ id: "Refresh inbox", values: { name: "name" }});
    /// t("Refresh inbox", { name: "name" });
    /// msg("msg.Refresh inbox");
    /// msg({ id: "msg.Refresh inbox", message: "msg.Refresh inbox message" });
    /// ```
    fn visit_mut_call_expr(&mut self, n: &mut CallExpr) {
        n.visit_mut_children_with(self);
        let mut work = || -> Option<()> {
            let ident = n.callee.as_expr()?.as_ident()?;
            let ident = ident.sym.to_string();
            if ident != self.config.t_fn && ident != self.config.msg_fn {
                return None;
            }
            let arg = &n.args;

            let first_arg = arg.first()?;
            let mut id = "".to_string();
            let mut default_msg = "".to_string();
            match *first_arg.expr.clone() {
                Expr::Lit(lit) => id = self.lit_to_string(lit)?,
                Expr::Tpl(tpl) => {
                    if tpl.exprs.is_empty() {
                        id = tpl.quasis.get(0)?.raw.to_string();
                    }
                }
                Expr::Object(obj) => {
                    id = self.pick_object_value(obj.clone(), &self.config.id.clone())?;
                    default_msg = self.pick_object_value(obj, &self.config.message.clone())?;
                }
                _ => (),
            }
            if id.is_empty() {
                // error!("msg id is not string literal, skip");
                HANDLER.with(|handler| {
                    handler.span_note_without_error(n.span, "msg id is not string literal, skip");
                });
            } else {
                self.extracted.try_add(
                    id,
                    default_msg,
                    self.source_map.lookup_char_pos(n.span.lo()),
                );
            }

            None
        };
        work();
    }

    // case: msg`hello name`
    fn visit_mut_tagged_tpl(&mut self, n: &mut TaggedTpl) {
        n.visit_mut_children_with(self);
        let mut work = || -> Option<()> {
            let ident = n.tag.as_ident()?.clone().sym;
            if ident != JsWord::from(self.config.msg_fn.clone()) {
                return None;
            }
            let id = n.tpl.quasis.get(0)?.raw.to_string();
            self.extracted.try_add(
                id,
                "".to_string(),
                self.source_map.lookup_char_pos(n.span.lo()),
            );
            None
        };
        work();
    }

    // case: <Trans id="msg.refresh" message="Refresh inbox" />
    fn visit_mut_jsx_opening_element(&mut self, n: &mut JSXOpeningElement) {
        n.visit_mut_children_with(self);
        let el_name = match &n.name {
            JSXElementName::Ident(ident) => ident.sym.to_string(),
            _ => "".to_string(),
        };
        if el_name != self.config.trans_component {
            return;
        }

        let mut work = || -> Option<()> {
            let mut id = "".to_string();
            let mut defaults = "".to_string();

            n.attrs.iter().for_each(|attr| {
                let mut work = || -> Option<()> {
                    match attr {
                        JSXAttrOrSpread::JSXAttr(attr) => {
                            let attr_name = match &attr.name {
                                JSXAttrName::Ident(ident) => ident.sym.to_string(),
                                _ => "".to_string(),
                            };
                            let value = self.jsx_attr_value_to_string(attr.value.clone());

                            if attr_name == self.config.id {
                                id = value?;
                            } else if attr_name == self.config.message {
                                defaults = value.unwrap_or("".into());
                            }
                        }
                        _ => {}
                    }
                    None
                };
                work();
            });
            if !id.is_empty() {
                self.extracted
                    .try_add(id, defaults, self.source_map.lookup_char_pos(n.span.lo()));
            };

            None
        };
        work();
    }
}
