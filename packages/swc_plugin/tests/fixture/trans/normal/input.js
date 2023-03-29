// normal
<Trans>Refresh inbox</Trans>;
// with variable
<Trans>Attachment {name} saved.</Trans>;
// with complex variable
<Trans>Attachment {props.name ?? defaultName} saved.</Trans>;
// Custom id is preserved:
<Trans id="message.attachment_saved">Attachment {name} saved.</Trans>;

//  inline markup
// simple inline markup
<Trans>
  Hello <br /> Mike
</Trans>;
<Trans>
  Hello <strong>{name}</strong>.
</Trans>;
<Trans>
  Hello <strong>{name}</strong>. <Link to="/inbox">See my profile</Link>
</Trans>;
<Trans>
  Welcome to <a>Next.js!</a> {counter}
</Trans>;

// 自动命名的变量
<Trans>
  Hello <strong>{obj.name}</strong>. <Link to="/inbox">See my profile</Link>
</Trans>;

// 多行文本
<Trans id={"Identity_Verification_desc"}>
  For the security of your account assets and transactions, and according to
  <strong>BAPPEBTI</strong> and <strong>Kominfo</strong>
  regulations, please verify your account.
</Trans>;
