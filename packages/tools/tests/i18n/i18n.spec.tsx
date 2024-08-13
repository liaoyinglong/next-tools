import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalesEnum, i18n } from "../../src/i18n";
import { enMessage, registerDefaultMessage } from "./shared";

beforeEach(() => {
  registerDefaultMessage();
});

describe("i18n", () => {
  it("load message and activate success", async () => {
    await i18n.activate(LocalesEnum.en);

    expect(i18n.locale).toBe(LocalesEnum.en);
    expect(i18n.t("hello")).toBe("hello");
    expect(i18n.t("hello {name}", { name: "world" })).toBe("hello world");

    await i18n.activate(LocalesEnum.zh);

    expect(i18n.locale).toBe(LocalesEnum.zh);
    expect(i18n.t("hello")).toBe("你好");
    expect(i18n.t("hello {name}", { name: "world" })).toBe("你好 world");
  });

  it("load message success", async () => {
    await i18n.activate(LocalesEnum.en);

    expect(i18n.locale).toBe(LocalesEnum.en);
    expect(i18n.messageLoadResult[LocalesEnum.en]).toMatchInlineSnapshot(`
      {
        "error_221040": [
          "Nama variabel sudah ada: ",
          [
            "0",
          ],
        ],
        "error_221041": [
          "Variabel belum didefinisikan: ",
          [
            "0",
          ],
        ],
        "hello": "hello",
        "hello <0>{name}</0>": [
          "hello <0>",
          [
            "name",
          ],
          "</0>",
        ],
        "hello {name}": [
          "hello ",
          [
            "name",
          ],
        ],
      }
    `);
    expect(i18n.baseI18n.messages).toMatchInlineSnapshot(`
      {
        "error_221040": [
          "Nama variabel sudah ada: ",
          [
            "0",
          ],
        ],
        "error_221041": [
          "Variabel belum didefinisikan: ",
          [
            "0",
          ],
        ],
        "hello": "hello",
        "hello <0>{name}</0>": [
          "hello <0>",
          [
            "name",
          ],
          "</0>",
        ],
        "hello {name}": [
          "hello ",
          [
            "name",
          ],
        ],
      }
    `);

    await i18n.activate(LocalesEnum.zh);
    expect(i18n.locale).toBe(LocalesEnum.zh);
    expect(i18n.messageLoadResult[LocalesEnum.zh]).toMatchInlineSnapshot(`
      {
        "error_221040": [
          "变量名已存在：",
          [
            "0",
          ],
        ],
        "error_221041": [
          "未定义的变量：",
          [
            "0",
          ],
        ],
        "hello": "你好",
        "hello <0>{name}</0>": [
          "你好 <0>",
          [
            "name",
          ],
          "</0>",
        ],
        "hello {name}": [
          "你好 ",
          [
            "name",
          ],
        ],
      }
    `);
    expect(i18n.baseI18n.messages).toMatchInlineSnapshot(`
      {
        "error_221040": [
          "变量名已存在：",
          [
            "0",
          ],
        ],
        "error_221041": [
          "未定义的变量：",
          [
            "0",
          ],
        ],
        "hello": "你好",
        "hello <0>{name}</0>": [
          "你好 <0>",
          [
            "name",
          ],
          "</0>",
        ],
        "hello {name}": [
          "你好 ",
          [
            "name",
          ],
        ],
      }
    `);
  });

  it("extra loadMessage", async () => {
    await i18n.activate(LocalesEnum.en);

    i18n.loadMessage(LocalesEnum.en, {
      ...enMessage,
      "Attachment {name} saved": "Attachment {name} saved",
    });

    expect(i18n.t("hello {name}", { name: "world" })).toBe("hello world");
    expect(i18n.t("Attachment {name} saved", { name: "world" })).toBe(
      "Attachment world saved",
    );
  });

  it("eventEmitter", async () => {
    const onLocaleChange = vi.fn();
    i18n.on("localeChange", onLocaleChange);

    const onChange = vi.fn();
    i18n.on("change", onChange);

    await i18n.activate(LocalesEnum.en);
    expect(onLocaleChange).toBeCalledTimes(1);
    expect(onLocaleChange).toBeCalledWith(LocalesEnum.en);

    expect(onChange.mock.calls.length >= 1).toBeTruthy();
    expect(onChange).toBeCalledWith();

    i18n.loadMessage(LocalesEnum.en, {});
    expect(onLocaleChange).toBeCalledTimes(1);
    expect(onChange.mock.calls.length >= 2).toBeTruthy();
  });
});
