// normal
<Trans id="Refresh inbox"></Trans>;
// with variable
<Trans id="Attachment {name} saved." values={{
    name: name
}}></Trans>;
// with complex variable
<Trans id="Attachment {0} saved." values={{
    0: props.name ?? defaultName
}}></Trans>;
// Custom id is preserved:
<Trans id="message.attachment_saved" message="Attachment {name} saved."></Trans>;
//  inline markup
<Trans id="Read the <0>docs</0>." components={{0: <a href="/docs" />}}></Trans>;
