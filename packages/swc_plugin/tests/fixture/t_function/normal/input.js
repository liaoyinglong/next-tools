// should transform
// normal string
t`Refresh inbox`;
// template string
t`Attachment ${name} saved`;
t`Attachment ${name} saved ${name}`;
t`Attachment ${name} saved ${name2}`;
// object
t`Attachment ${props.name} saved`;
t`Attachment ${props.firstName} saved ${props.secondName}`;
// complex expression
t`Attachment ${props.firstName || props.secondName} saved`;
t`Attachment ${props.age + 1} saved`;

// other cases
<div>{t`hello ${name}`}</div>;
<div title={t`hello ${name}`}></div>;
var a = t`hello ${name}`;
var obj = { a: t`hello ${name}` };
var obj = { [t`hello ${name}`]: "string" };
var arr = [t`hello ${name}`];
var a = Math.random() ? t`hello ${name}` : t`hello ${name2}`;
//prettier-ignore
var a = Math.random() ? (t`hello ${name}`) : (t`hello ${name2}`);
var a = Math.random() && t`hello ${name}`;
console.log(t`hello ${name}`);
new VerifyPlaceOrderParamError(t`hello ${name}`);
const { node = t`hello ${name}` } = props;

// return statement
function a() {
  return t`hello ${name}`;
}
// as type 
var obj = [{
  title: t`项目` as string,
  dataIndex: 'label',
  width: 200,
}];

// ====================
// should not transform
t("Refresh inbox");
t(`Attachment ${name} saved`);

raw`Refresh inbox`;
t({ id: "Refresh inbox", message: "Refresh inbox" });
obj.t("Refresh inbox");
obj.t(`Refresh inbox ${name}`);
