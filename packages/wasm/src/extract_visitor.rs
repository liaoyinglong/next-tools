use serde::{Deserialize, Serialize};
use swc_core::common::collections::AHashMap;
use swc_core::ecma::ast::{
    CallExpr, Expr, ExprOrSpread, JSXAttrName, JSXAttrOrSpread, JSXAttrValue, JSXElementName,
    JSXExpr, JSXOpeningElement, Lit,
};
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMut};

#[derive(Debug, PartialEq, Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    // 翻译文案的id
    #[serde(default, skip_deserializing)]
    pub id: String,
    // 默认的翻译文案
    #[serde(default)]
    pub messages: String,
}

#[derive(Debug)]
pub struct Config {
    pub id: String,
    pub messages: String,
    pub trans_component: String,
    pub t_fn: String,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            trans_component: "Trans".to_string(),
            t_fn: "t".to_string(),
            id: "id".to_string(),
            messages: "messages".to_string(),
        }
    }
}

#[derive(Default)]
pub struct ExtractVisitor {
    pub data: AHashMap<String, Item>,
    pub config: Config,
}

impl ExtractVisitor {
    pub fn new() -> Self {
        ExtractVisitor {
            data: AHashMap::default(),
            config: Config::default(),
        }
    }

    fn lit_to_string(&mut self, lit: Lit) -> Option<String> {
        match lit {
            Lit::Str(str) => Some(str.value.to_string()),
            Lit::Num(num) => Some(num.value.to_string()),
            _ => None,
        }
    }

    fn expr_or_spread_to_string(&mut self, item: Option<&ExprOrSpread>) -> Option<String> {
        let lit = item?.expr.clone().lit()?;
        self.lit_to_string(lit)
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

    // case: t("msg.id", { name: "Tom" }, { defaults: "My name is {name}" })
    fn visit_mut_call_expr(&mut self, n: &mut CallExpr) {
        n.visit_mut_children_with(self);
        let mut work = || -> Option<()> {
            let ident = n.callee.as_expr()?.as_ident()?;
            if ident.sym.to_string() != self.config.t_fn {
                return None;
            }
            let arg = &n.args;

            //region 获取msg id
            let id_arg = arg.first();
            let id = self.expr_or_spread_to_string(id_arg)?;
            //endregion
            //region 获取msg defaults
            let default_msg_arg = arg.get(2);
            let default_msg = self
                .expr_or_spread_to_string(default_msg_arg)
                .unwrap_or("".into());
            //endregion
            self.data.insert(
                id.clone(),
                Item {
                    id,
                    messages: default_msg,
                },
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
                            } else if attr_name == self.config.messages {
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
                self.data.insert(
                    id.clone(),
                    Item {
                        id,
                        messages: defaults,
                    },
                );
            };

            None
        };
        work();
    }
}
