import { loadWasm } from "@/shared/wasm-pkg";
import { Extracted } from "@dune2/wasm";

import styled from "@emotion/styled";
import Editor from "@monaco-editor/react";
import { useMDXComponents } from "nextra/mdx";
import { useEffect, useState } from "react";

const Item = styled.div`
  display: grid;
  grid-row-gap: 12px;
`;

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
      "<Trans>trans.hello <h1>{name}</h1></Trans>;",
    ].join("\n");
  });

  const [extracted, setExtracted] = useState({
    data: {},
    errMsg: "",
  });

  const [transformed, setTransformed] = useState("");

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
        const code = wasm.transformSync(inputtedCode);
        setTransformed(code);
      } catch (e) {
        setTransformed("");
        console.log(`transform error: `, e);
      }
    };

    extract();
    transform();
  }, [inputtedCode]);

  return (
    <>
      <Item>
        <Title>输入代码</Title>
        <Editor
          width="100%"
          height="400px"
          language="javascript"
          theme={"vs-dark"}
          defaultValue={inputtedCode}
          onChange={(value) => setInputtedCode(value || "")}
        />
      </Item>

      <Item>
        <Title>编译后的代码</Title>
        <Editor
          width="100%"
          height="400px"
          language="javascript"
          theme={"vs-dark"}
          value={transformed}
        />
      </Item>

      <Item>
        <Title>提取到的文案</Title>
        <Editor
          width="100%"
          height="300px"
          language="json"
          theme={"vs-dark"}
          value={JSON.stringify(extracted.data, null, 2)}
        />
      </Item>
    </>
  );
}
