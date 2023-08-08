import { describe, expect, it } from "vitest";
import { autoNamespaceByReg } from "../src/shared/autoNamespaceByReg";

describe("autoNamespaceByReg", () => {
  it("反引号", function () {
    expect(
      autoNamespaceByReg(
        ["{t`login`}", " t`login`", "(t`hello ${name}`)"].join("\n"),
        "Merchants"
      )
    ).toMatchInlineSnapshot(`
      "{t\`Merchants.login\`}
       t\`Merchants.login\`
      (t\`Merchants.hello \${name}\`)"
    `);
  });

  it("引号", function () {
    expect(
      autoNamespaceByReg(
        ["{t('引号')}", `(t("引号"))`].join("\n"),
        "Merchants"
      )
    ).toMatchInlineSnapshot(`
      "{t('Merchants.引号')}
      (t(\\"Merchants.引号\\"))"
    `);
  });

  it("对象入参", function () {
    expect(
      autoNamespaceByReg(
        ["{t('hello: {name}',{ name:'zhangsan' })}"].join("\n"),
        "Merchants"
      )
    ).toMatchInlineSnapshot('"{t(\'Merchants.hello: {name}\',{ name:\'zhangsan\' })}"');
  })

  it("不应该替换已经有 namespace 的", function () {
    expect(
      autoNamespaceByReg(
        [
          " t`Merchants.login`",
          ` t('Merchants.login')`,
          ' t("Merchants.login")',
          "set`login`",
          `set('login')`,
          `set("login")`,
          //
          " t`login`",
          ' t("login")',
          ` t('login')`,
          `arr.split('login')`,
        ].join("\n"),
        "Menu"
      )
    ).toMatchInlineSnapshot(`
      " t\`Merchants.login\`
       t('Merchants.login')
       t(\\"Merchants.login\\")
      set\`login\`
      set('login')
      set(\\"login\\")
       t\`Menu.login\`
       t(\\"Menu.login\\")
       t('Menu.login')
      arr.split('login')"
    `);
  });

});
