// should transform
// normal string
t("Refresh inbox");
// template string
t("Attachment {name} saved", {
    name: name
});
t("Attachment {name} saved {name}", {
    name: name
});
t("Attachment {name} saved {name2}", {
    name: name,
    name2: name2
});
// object
t("Attachment {0} saved", {
    0: props.name
});
t("Attachment {0} saved {1}", {
    0: props.firstName,
    1: props.secondName
});
// complex expression
t("Attachment {0} saved", {
    0: props.firstName || props.secondName
});
t("Attachment {0} saved", {
    0: props.age + 1
});
// other cases
<div >{t("hello {name}", {
    name: name
})}</div>;
<div title={t("hello {name}", {
    name: name
})}></div>;
var a = t("hello {name}", {
    name: name
});
var obj = {
    a: t("hello {name}", {
        name: name
    })
};
var obj = {
    [t("hello {name}", {
        name: name
    })]: "string"
};
var arr = [
    t("hello {name}", {
        name: name
    })
];
var a = Math.random() ? t("hello {name}", {
    name: name
}) : t("hello {name2}", {
    name2: name2
});
var a = Math.random() ? t("hello {name}", {
    name: name
}) : t("hello {name2}", {
    name2: name2
});
var a = Math.random() && t("hello {name}", {
    name: name
});
console.log(t("hello {name}", {
    name: name
}));
// return statement
function a() {
    return t("hello {name}", {
        name: name
    });
}
// ====================
// should not transform
t("Refresh inbox");
t(`Attachment ${name} saved`);
raw`Refresh inbox`;
t({
    id: "Refresh inbox",
    message: "Refresh inbox"
});
obj.t("Refresh inbox");
obj.t(`Refresh inbox ${name}`);
