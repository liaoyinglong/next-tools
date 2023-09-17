import { loadWasm } from "@/shared/wasm-pkg";
import { Extracted } from "@dune2/wasm";

import Editor from "@monaco-editor/react";
import { Pre } from "nextra/components";
import { useMDXComponents } from "nextra/mdx";
import { useEffect, useState } from "react";

export function I18nPlayground() {
  const components = useMDXComponents();
  const Title = components.h3;

  const [inputtedCode, setInputtedCode] = useState(() => {
    return [
      `t(ddd);`,
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
        const keys = [...extracted.data.keys()].sort();
        keys.forEach((k) => {
          const v = extracted.data.get(k);
          data[k] = v.messages || v.id;
        });
        setExtracted({
          errMsg: extracted.errMsg,
          data,
        });
      } catch (e) {
        console.log(`extract error: `, e);
      }
    };

    const transform = async () => {
      const wasm = await loadWasm();
      try {
        //   TODO: not implemented
      } catch (e) {
        console.log(`transform error: `, e);
      }
    };

    extract();
    transform();
  }, [inputtedCode]);

  return (
    <div>
      <Title>输入代码</Title>
      <Editor
        width="100%"
        height="400px"
        language="javascript"
        theme={"vs-dark"}
        defaultValue={inputtedCode}
        onChange={(value) => setInputtedCode(value || "")}
      />

      <Title>编译后的代码</Title>
      <Pre
        data-language={"ts"}
        hasCopyCode
      >{`import { useIntl } from 'react-intl';`}</Pre>

      <Title>提取到的文案</Title>
      <Editor
        width="100%"
        height="300px"
        language="json"
        theme={"vs-dark"}
        value={JSON.stringify(extracted.data, null, 2)}
        // value={extracted.errMsg}
      />
    </div>
  );
}
