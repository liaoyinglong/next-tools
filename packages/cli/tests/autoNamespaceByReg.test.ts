import { describe, expect, it } from "vitest";
import { autoNamespaceByReg } from "../src/shared/autoNamespaceByReg";

describe("autoNamespaceByReg", () => {
  it("tpl", function () {
    expect(
      autoNamespaceByReg(
        ["t`login`", "t`hello ${name}`"].join("\n"),
        "Merchants"
      )
    ).toMatchInlineSnapshot(`
      "t\`Merchants.login\`
      t\`Merchants.hello \${name}\`"
    `);
  });
  it("normal", () => {
    expect(
      autoNamespaceByReg(
        [
          't("login")',
          `t('login')`,
          `t("login")`,
          `t('hello {name}', { name: 'world' })`,
          `t("hello {name}", { name: 'world' })`,
        ].join("\n"),
        "Menu"
      )
    ).toMatchInlineSnapshot(`
      "t('Menu.login')
      t('Menu.login')
      t('Menu.login')
      t('Menu.hello {name}', { name: 'world' })
      t('Menu.hello {name}', { name: 'world' })"
    `);
  });

  it("不应该替换已经有 namespace 的", function () {
    expect(
      autoNamespaceByReg(
        [
          "t`Merchants.login`",
          `t('Merchants.login')`,
          't("Merchants.login")',
          "set`login`",
          `set('login')`,
          `set("login")`,
          //
          "t`login`",
          't("login")',
          `t('login')`,
          `arr.split('login')`,
        ].join("\n"),
        "Menu"
      )
    ).toMatchInlineSnapshot(`
      "t\`Merchants.login\`
      t('Merchants.login')
      t(\\"Merchants.login\\")
      set\`login\`
      set('login')
      set(\\"login\\")
      t\`Menu.login\`
      t('Menu.login')
      t('Menu.login')
      arr.split('login')"
    `);
  });
});
