import { act, render } from "@testing-library/react";
import { type PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { I18nProvider, LocalesEnum, Trans, i18n } from "../../src/i18n";
import { registerDefaultAsyncMessage, registerDefaultMessage } from "./shared";

describe("trans", () => {
  // setup i18n
  const wrapper = (props: PropsWithChildren) => {
    return (
      <I18nProvider enableDetectLocale={false}>{props.children}</I18nProvider>
    );
  };
  const name = "world";

  const ui = (
    <>
      <span>
        <Trans id={"hello"}></Trans>
      </span>
      <span>
        <Trans id="hello {name}" values={{ name: name }}></Trans>
      </span>
      <span>
        <Trans
          id="hello <0>{name}</0>"
          values={{ name: name }}
          components={{ 0: <h1>{name}</h1> }}
        ></Trans>
      </span>
    </>
  );

  it("work with sync message loader", () => {
    registerDefaultMessage();
    i18n.activate(LocalesEnum.en);

    const { container } = render(ui, {
      wrapper,
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span>
          hello
        </span>
        <span>
          hello world
        </span>
        <span>
          hello 
          <h1>
            world
          </h1>
        </span>
      </div>
    `);

    act(() => {
      i18n.activate(LocalesEnum.zh);
    });
    expect(container).toMatchInlineSnapshot(`
      <div>
        <span>
          你好
        </span>
        <span>
          你好 world
        </span>
        <span>
          你好 
          <h1>
            world
          </h1>
        </span>
      </div>
    `);
  });

  it("work with async message loader", async () => {
    registerDefaultAsyncMessage();
    await i18n.activate(LocalesEnum.en);

    const { container } = render(ui, {
      wrapper,
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span>
          hello
        </span>
        <span>
          hello world
        </span>
        <span>
          hello 
          <h1>
            world
          </h1>
        </span>
      </div>
    `);
    // change locale
    await act(() => {
      return i18n.activate(LocalesEnum.zh);
    });
    expect(container).toMatchInlineSnapshot(`
      <div>
        <span>
          你好
        </span>
        <span>
          你好 world
        </span>
        <span>
          你好 
          <h1>
            world
          </h1>
        </span>
      </div>
    `);
  });
});
