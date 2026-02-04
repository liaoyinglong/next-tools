import enquirer from 'enquirer';
import { ApiConfig } from './config';
const { prompt } = enquirer;

interface Opt<T> {
  configArr: (T & { enabled?: boolean })[];
  getChoiceItem: (item: T) => {
    name: string;
    message?: string;
    value?: string;
    hint?: string;
  };
  checkIsEnabled: (enabledArr: string[], item: T) => boolean;
}

export async function promptConfigEnable<T>(opt: Opt<T>) {
  const { configArr, getChoiceItem } = opt;
  // 只有一条配置的时候不用选择
  if (configArr.length <= 1) {
    return configArr;
  }

  const choices = [
    {
      name: '全部',
      message: '全部',
      choices: configArr.map((item) => {
        return getChoiceItem(item);
      }),
    },
  ];
  const res = await prompt<{ enabled: string[] }>({
    type: 'multiselect',
    message: '选择要生效的配置项',
    // @ts-ignore
    hint: '(空格选中，回车确认)',
    name: 'enabled',
    validate(value) {
      return value.length === 0 ? `至少选择一项` : true;
    },
    choices,
  });

  configArr.forEach((item) => {
    item.enabled = opt.checkIsEnabled(res.enabled, item);
  });

  return configArr.filter((c) => c.enabled);
}

export function promptApiConfigEnable(configArr: ApiConfig[] | undefined) {
  return promptConfigEnable({
    configArr: configArr ?? [],
    getChoiceItem: (item) => {
      return {
        name: item.output!,
        hint: `swaggerJSONPath: ${item.swaggerJSONPath}`,
      };
    },
    checkIsEnabled: (enabledArr, item) => {
      return enabledArr.includes(item.output!);
    },
  });
}
