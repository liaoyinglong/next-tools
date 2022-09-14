// normal
<Trans id="Refresh inbox" />
// with variable
<Trans id="Attachment {name} saved."/>;
// Custom id is preserved:
<Trans id="message.attachment_saved" message="Attachment {name} saved." />
//  inline markup
<Trans id="Read the <0>docs</0>." components={{0: <a href="/docs" />}} />
