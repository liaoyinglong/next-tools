import { t } from '@lyl/i18next';

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

// function call with template string
t(`Attachment ${name} saved`);

// ====================
// should not transform
t("Refresh inbox");
raw`Refresh inbox`;
obj.t("Refresh inbox");
obj.t(`Refresh inbox ${name}`);
