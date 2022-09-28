import { parse } from "messageformat-parser";

const isString = (s): s is string => typeof s === "string";

type CompiledMessage =
  | string
  | Array<
      string | Array<string | (string | undefined) | Record<string, unknown>>
    >;

// [Tokens] -> (CTX -> String)
function processTokens(tokens) {
  if (!tokens.filter((token) => !isString(token)).length) {
    return tokens.join("");
  }

  return tokens.map((token) => {
    if (isString(token)) {
      return token;

      // # in plural case
    } else if (token.type === "octothorpe") {
      return "#";

      // simple argument
    } else if (token.type === "argument") {
      return [token.arg];

      // argument with custom format (date, number)
    } else if (token.type === "function") {
      const _param = token.param && token.param.tokens[0];
      const param = typeof _param === "string" ? _param.trim() : _param;
      return [token.arg, token.key, param].filter(Boolean);
    }

    const offset = token.offset ? parseInt(token.offset) : undefined;

    // complex argument with cases
    const formatProps = {};
    token.cases.forEach((item) => {
      formatProps[item.key] = processTokens(item.tokens);
    });

    return [
      token.arg,
      token.type,
      {
        offset,
        ...formatProps,
      },
    ];
  });
}

// Message -> (Params -> String)
export default function compile(message: string): CompiledMessage {
  try {
    const tokens = parse(message);
    // console.log("tokens", tokens);
    return processTokens(tokens);
  } catch (e) {
    console.error(`Message cannot be parsed due to syntax errors: ${message}`);
    return message;
  }
}