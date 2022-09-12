import { t } from '@lyl/i18next';

// should transform
t`Refresh inbox`;
t`Attachment ${name} saved`;
t`Attachment ${name} saved ${name}`;
t`Attachment ${name} saved ${name2}`;
t`Attachment ${props.name} saved`;
t`Attachment ${props.firstName} saved ${props.secondName}`;

// should not transform
t("Refresh inbox");
t(`Attachment ${name} saved`);
raw`Refresh inbox`;
