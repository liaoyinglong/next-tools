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
// should not transform
t("Refresh inbox");
t(`Attachment ${name} saved`);
raw`Refresh inbox`;