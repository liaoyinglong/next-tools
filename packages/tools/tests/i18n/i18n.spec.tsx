import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalesEnum, i18n, t } from "../../i18n";

const enMessage = {
  hello: "hello",
  "hello {name}": "hello {name}",
};
const zhMessage = {
  hello: "你好",
  "hello {name}": "你好 {name}",
};

beforeEach(() => {
  i18n.register(LocalesEnum.en, [enMessage]);
  // 模拟中文是 异步加载的
  i18n.register(LocalesEnum.zh, () => [Promise.resolve(zhMessage)]);
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
        "hello": "hello",
        "hello {name}": "hello {name}",
      }
    `);
    expect(i18n.baseI18n.messages).toMatchInlineSnapshot(`
      {
        "hello": "hello",
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
        "hello": "你好",
        "hello {name}": "你好 {name}",
      }
    `);
    expect(i18n.baseI18n.messages).toMatchInlineSnapshot(`
      {
        "hello": "你好",
        "hello {name}": [
          "你好 ",
          [
            "name",
          ],
        ],
      }
    `);
  });

  it("load message with error", async () => {
    // 劫持 console.error
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => void 0);
    // 重新注册语言包，让其中报错一个
    i18n.register(LocalesEnum.zh, () => [
      Promise.resolve(zhMessage),
      Promise.reject(`network error`),
    ]);

    await i18n.activate(LocalesEnum.zh);
    expect(i18n.messageLoadResult[LocalesEnum.zh]).toMatchInlineSnapshot(`
      {
        "hello": "你好",
        "hello {name}": "你好 {name}",
      }
    `);
    expect(i18n.baseI18n.messages).toMatchInlineSnapshot(`
      {
        "hello": "你好",
        "hello {name}": [
          "你好 ",
          [
            "name",
          ],
        ],
      }
    `);
    // 确认打印相关错误信息方便 debug
    expect(consoleErrorMock).toBeCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "load zh translate failed: ",
      "network error"
    );
  });

  it("t.ignoreExtract", () => {
    expect(t.ignoreExtract).toBe(t);
  });

  it("t.displayError", () => {
    expect(t.displayError(1)).toBe("error_1");
    expect(t.displayError("1")).toBe("error_1");
    expect(t.displayError({ code: 1 })).toBe("error_1");
    expect(t.displayError({ code: 1, message: "message" })).toBe("message");
  });
});
