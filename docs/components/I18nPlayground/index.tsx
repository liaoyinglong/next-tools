import { TextArea } from "@radix-ui/themes";
import { Pre } from "nextra/components";
import { useMDXComponents } from "nextra/mdx";

export function I18nPlayground() {
  const components = useMDXComponents();
  const Title = components.h3;

  return (
    <div>
      <Title>输入代码</Title>
      <TextArea mt={"4"} size={"3"} />

      <Title>编译后的代码</Title>
      <Pre
        data-language={"ts"}
        hasCopyCode
      >{`import { useIntl } from 'react-intl';`}</Pre>

      <Title>提取到的文案</Title>
      <Pre
        data-language={"ts"}
        hasCopyCode
      >{`import { useIntl } from 'react-intl';`}</Pre>
    </div>
  );
}
