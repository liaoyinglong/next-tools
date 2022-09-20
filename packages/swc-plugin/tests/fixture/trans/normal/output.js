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
<Trans id="message.attachment_saved" messages="Attachment {name} saved." values={{
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
