import { t } from '@lyl/i18next';

// should transform
t("Refresh inbox");
t("Refresh inbox");

// t`Attachment ${name} saved`
// t(`Attachment ${name} saved`)

// should not transform
raw`Refresh inbox`;