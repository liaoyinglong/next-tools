import type { Content, Token } from "@messageformat/parser";
import { parse } from "@messageformat/parser";

export type CompiledIcuChoices = Record<string, CompiledMessage> & {
  offset: number | undefined;
};

export type CompiledMessageToken =
  | string
  | [name: string, type?: string, format?: null | string | CompiledIcuChoices];

export type CompiledMessage = string | CompiledMessageToken[];

type MapTextFn = (value: string) => string;

function processTokens(tokens: Token[], mapText: MapTextFn): CompiledMessage {
  if (!tokens.filter((token) => token.type !== "content").length) {
    return tokens.map((token) => mapText((token as Content).value)).join("");
  }

  return tokens.map<CompiledMessageToken>((token) => {
    if (token.type === "content") {
      return mapText(token.value);

      // # in plural case
    } else if (token.type === "octothorpe") {
      return "#";

      // simple argument
    } else if (token.type === "argument") {
      return [token.arg];

      // argument with custom format (date, number)
    } else if (token.type === "function") {
      const _param = token?.param?.[0] as Content;

      if (_param) {
        return [token.arg, token.key, _param.value.trim()];
      } else {
        return [token.arg, token.key];
      }
    }

    const offset = token.pluralOffset;

    // complex argument with cases
    const formatProps: Record<string, CompiledMessage> = {};
    token.cases.forEach((item) => {
      formatProps[item.key.replace(/^=(.)+/, "$1")] = processTokens(
        item.tokens,
        mapText,
      );
    });

    return [
      token.arg,
      token.type,
      {
        offset,
        ...formatProps,
      } as CompiledIcuChoices,
    ];
  });
}

export function compileMessage(
  message: string,
  mapText: MapTextFn = (v) => v,
): CompiledMessage {
  try {
    return processTokens(parse(message), mapText);
  } catch (e) {
    console.error(`${(e as Error).message} \n\nMessage: ${message}`);
    return message;
  }
}

/**
 * 编译消息函数
 * 使用建议：
 * 1. 在 rsc 中直接使用，会减少 client 端的打包大小
 * 2. 在 spa 中直接使用，会增加 client 端的打包大小
 */
export function compileMessages(msgs: Record<string, string>) {
  // 创建一个空对象用于存储编译后的消息
  const compiled: Record<string, any> = {};

  // 遍历输入的消息对象的键
  Object.keys(msgs).forEach((k) => {
    // 将编译后的消息存入 compiled 对象
    compiled[k] = compileMessage(msgs[k] || k);
  });

  // 返回编译后的消息对象
  return compiled;
}
