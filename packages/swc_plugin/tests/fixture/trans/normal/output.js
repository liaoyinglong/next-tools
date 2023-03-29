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
<Trans id="message.attachment_saved" message="Attachment {name} saved." values={{
    name: name
}}></Trans>;
//  inline markup
// simple inline markup
<Trans id="Hello <0/> Mike" components={{
    0: <br />
}}></Trans>;
<Trans id="Hello <0>{name}</0>." values={{
    name: name
}} components={{
    0: <strong >{name}</strong>
}}></Trans>;
<Trans id="Hello <0>{name}</0>. <1>See my profile</1>" values={{
    name: name
}} components={{
    0: <strong >{name}</strong>,
    1: <Link to="/inbox">See my profile</Link>
}}></Trans>;
<Trans id="Welcome to <0>Next.js!</0> {counter}" values={{
    counter: counter
}} components={{
    0: <a >Next.js!</a>
}}></Trans>;
// 自动命名的变量
<Trans id="Hello <0>{1}</0>. <2>See my profile</2>" values={{
    1: obj.name
}} components={{
    0: <strong >{obj.name}</strong>,
    2: <Link to="/inbox">See my profile</Link>
}}></Trans>;
// 多行文本
<Trans id={"Identity_Verification_desc"} message="For the security of your account assets and transactions, and according to <0>BAPPEBTI</0> and <1>Kominfo</1>regulations, please verify your account." components={{
    0: <strong >BAPPEBTI</strong>,
    1: <strong >Kominfo</strong>
}}></Trans>;
