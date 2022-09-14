
import { t } from '@lyl/i18next';
// should transform
// normal string
t("Refresh inbox");
// template string
t("Attachment {name} saved", {
    name: name
});
t("Attachment {name} saved {name}", {
    name: name
});
t("Attachment {name} saved {name2}", {
    name: name,
    name2: name2
});
// object
t("Attachment {0} saved", {
    0: props.name
});
t("Attachment {0} saved {1}", {
    0: props.firstName,
    1: props.secondName
});
// complex expression
t("Attachment {0} saved", {
    0: props.firstName || props.secondName
});
t("Attachment {0} saved", {
    0: props.age + 1
});
// function call with template string
t("Attachment {name} saved", {
    name: name
});
// ====================
// should not transform
t("Refresh inbox");
raw`Refresh inbox`;
obj.t("Refresh inbox");
obj.t(`Refresh inbox ${name}`);