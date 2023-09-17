import { loadWasm } from "@/shared/wasm-pkg";
import { Extracted } from "@dune2/wasm";
import { TextArea } from "@radix-ui/themes";
import { Code as NextraCode, Pre } from "nextra/components";
import { useMDXComponents } from "nextra/mdx";
import { useEffect, useState } from "react";

export function I18nPlayground() {
  const components = useMDXComponents();
  const Title = components.h3;

  const [inputtedCode, setInputtedCode] = useState(() => {
    // `t(ddd);`,
    return [
      "// t fn 调用",
      "t`tag.hello`;",
      "t`tag.hello ${name}`;",
      't("fn.hello {name}",{ name: 123 });',
      "",
      "// Trans 调用",
      "<Trans>trans.hello</Trans>;",
      "<Trans>trans.hello {name}</Trans>;",
    ].join("\n");
  });

  const [extracted, setExtracted] = useState({
    data: {},
    errMsg: "",
  });

  useEffect(() => {
    const extract = async () => {
      const wasm = await loadWasm();
      try {
        const extracted: Extracted = await wasm.extract(
          inputtedCode,
          "/test.tsx"
        );
        const data = {};
        extracted.data.forEach((v, k) => {
          data[k] = v.messages || v.id;
        });
        setExtracted({
          errMsg: extracted.errMsg,
          data,
        });
      } catch (e) {}
    };

    extract();
  }, [inputtedCode]);

  return (
    <div>
      <Title>输入代码</Title>
      <TextArea
        mt={"4"}
        size={"3"}
        value={inputtedCode}
        rows={10}
        onChange={(e) => {
          setInputtedCode(e.target.value);
        }}
      />

      <Title>编译后的代码</Title>
      <Pre
        data-language={"ts"}
        hasCopyCode
      >{`import { useIntl } from 'react-intl';`}</Pre>

      <Pre data-language={"ts"}>{`import { useIntl } from 'react-intl';`}</Pre>

      <Title>提取到的文案</Title>
      <Code>{extracted.data}</Code>
    </div>
  );
}

interface CodeProps {
  children: string | Record<any, any> | any[];
  language?: "ansi" | "json";
}
const Code = (props: CodeProps) => {
  const arr = (() => {
    try {
      const str =
        typeof props.children === "string"
          ? props.children
          : JSON.stringify(props.children, null, 2);
      return str.split("\n");
    } catch (e) {
      console.log(`解析 code children 失败：`, e);
      return null;
    }
  })();

  return (
    <Pre data-language={props.language ?? "json"} hasCopyCode>
      <NextraCode>
        {arr
          ? arr.map((v) => {
              return (
                <span className={"line"} key={v}>
                  {v}
                </span>
              );
            })
          : `ERROR: 解析失败，打开控制台查看报错`}
      </NextraCode>
    </Pre>
  );
};
