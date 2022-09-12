import { t } from '@lyl/i18next';
// should transform
t("Refresh inbox");
t("Attachment {name} saved", {
    name
});
t("Attachment {name} saved {name}", {
    name
});
t("Attachment {name} saved {name2}", {
    name,
    name2
});
t("Attachment {0} saved", {
    0: props.name
});
t("Attachment {0} saved {1}", {
    0: props.firstName,
    1: props.secondName
});
// should not transform
t("Refresh inbox");
t(`Attachment ${name} saved`);
raw`Refresh inbox`;