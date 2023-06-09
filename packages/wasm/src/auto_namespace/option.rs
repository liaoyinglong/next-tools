use std::sync::Arc;
use swc_core::common::errors::HANDLER;
use swc_core::common::sync::Lrc;
use swc_core::common::SourceMap;
use swc_core::ecma::ast::{
    CallExpr, Expr, ExprOrSpread, JSXAttr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue,
    JSXElementName, JSXExpr, JSXOpeningElement, Lit, ObjectLit, Str,
};
use swc_core::ecma::atoms::JsWord;
use swc_core::ecma::utils::quote_ident;
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::visit::{noop_visit_mut_type, VisitMut};

#[derive(Clone)]
pub struct AutoNamespaceOption {
    /// 源代码
    pub source: String,
    /// 翻译key的前缀
    pub namespace: String,
    /// 用于分割 namespace 和 key 的字符串
    pub separator: String,

    /// Trans component name
    /// default is Trans
    pub trans_component: String,
    // Trans component  ia attr name
    // default is id
    pub id_attr: String,

    // 默认的翻译函数 t
    pub t_fn: String,
}

impl AutoNamespaceOption {
    // 添加 namespace
    fn add_namespace(&mut self, str: String) -> Option<String> {
        // 已经带有 namespace 前缀的不处理
        let x: Vec<_> = str.split(self.separator.as_str()).collect();
        if x.len() > 1 {
            return None;
        }

        Some(format!("{}{}{}", self.namespace, self.separator, str))
    }

    // Trans 组件 处理
    fn get_jsx_attr_or_spread(&mut self, str: String) -> Option<JSXAttrOrSpread> {
        let v = self.add_namespace(str)?;
        let v = JsWord::from(v);
        Some(JSXAttrOrSpread::JSXAttr(JSXAttr {
            span: Default::default(),
            name: JSXAttrName::Ident(quote_ident!(self.id_attr.clone())),
            value: Some(JSXAttrValue::Lit(Lit::Str(Str {
                span: Default::default(),
                value: v,
                raw: None,
            }))),
        }))
    }

    fn append_to_lit(&mut self, lit: Lit) -> Option<JSXAttrOrSpread> {
        match lit {
            Lit::Str(str) => self.get_jsx_attr_or_spread(str.value.to_string()),
            Lit::Num(str) => self.get_jsx_attr_or_spread(str.value.to_string()),
            _ => None,
        }
    }

    fn find_attr_name(attr: JSXAttrOrSpread) -> Option<String> {
        if let JSXAttrOrSpread::JSXAttr(attr) = attr {
            if let JSXAttrName::Ident(id) = attr.name.clone() {
                return Some(id.sym.to_string());
            }
        };
        None
    }

    // t fn 处理
}

impl Default for AutoNamespaceOption {
    fn default() -> Self {
        AutoNamespaceOption {
            source: "".to_string(),
            namespace: "".to_string(),
            separator: ".".to_string(),
            trans_component: "Trans".to_string(),
            id_attr: "id".to_string(),
            t_fn: "t".to_string(),
        }
    }
}

impl VisitMut for AutoNamespaceOption {
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
    /// ```
    fn visit_mut_call_expr(&mut self, n: &mut CallExpr) {
        n.visit_mut_children_with(self);
        let new_args = vec![];

        let mut work = || -> Option<()> {
            let ident = n.callee.as_expr()?.as_ident()?;
            if ident.sym.to_string() != self.t_fn {
                return None;
            }
            let arg = &n.args;

            let first_arg = arg.first()?;
            let mut id = "".to_string();

            match *first_arg.expr.clone() {
                Expr::Lit(lit) => {
                    let v = self.add_namespace(lit.value.to_string())?;

                    let id_arg = ExprOrSpread {
                        spread: first_arg.spread.clone(),
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            span: Default::default(),
                            value: JsWord::from(v),
                            raw: None,
                        }))),
                    };
                    // n.args.0 = id_arg;
                    None
                }
                // Expr::Tpl(tpl) => {
                //     if tpl.exprs.is_empty() {
                //         id = tpl.quasis.get(0)?.raw.to_string();
                //     }
                // }
                // TODO：目前代码里没有人用 t({ id: "Refresh inbox", message: "Refresh inbox" }) 这种写法
                // Expr::Object(obj) => {
                //     id = self.pick_object_value(obj.clone(), &self.config.id.clone())?;
                //     default_msg = self.pick_object_value(obj, &self.config.message.clone())?;
                // }
                _ => None,
            }
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
        if el_name != self.trans_component {
            return;
        }

        let mut new_attrs: Vec<JSXAttrOrSpread> = vec![];

        n.attrs.iter().for_each(|attr| {
            let mut f = || -> Option<()> {
                let attr_name = Self::find_attr_name(attr.clone())?;
                if attr_name != self.id_attr {
                    new_attrs.push(attr.clone());
                    return None;
                }
                // 处理 对应的 attr
                let mut get_new_attr = || -> Option<JSXAttrOrSpread> {
                    if let JSXAttrOrSpread::JSXAttr(jsx_attr) = attr {
                        let v = jsx_attr.value.clone()?;
                        return match v {
                            JSXAttrValue::Lit(lit) => self.append_to_lit(lit),
                            JSXAttrValue::JSXExprContainer(container) => match container.expr {
                                JSXExpr::Expr(expr) => match *expr {
                                    Expr::Lit(lit) => self.append_to_lit(lit),
                                    Expr::Tpl(tpl) => {
                                        if tpl.exprs.is_empty() {
                                            let v = tpl
                                                .quasis
                                                .get(0)
                                                .map(|item| item.raw.to_string())?;

                                            return self.get_jsx_attr_or_spread(v);
                                        }
                                        // case <Trans id={`msg_${name}`} />, 这种不支持
                                        None
                                    }
                                    _ => None,
                                },
                                _ => None,
                            },
                            _ => None,
                        };
                    }
                    None
                };
                let new_lit = get_new_attr();
                match new_lit {
                    Some(new_attr) => new_attrs.push(new_attr),
                    _ => new_attrs.push(attr.clone()),
                };

                None
            };
            f();
        });

        n.attrs.clear();
        n.attrs.extend_from_slice(&*new_attrs)
    }
}
