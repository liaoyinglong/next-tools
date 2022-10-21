import { cli, createLogger } from "../shared";
import enquirer from "enquirer";
const { prompt } = enquirer;

const log = createLogger("interactive");

export const interactive = async (args: any) => {
  const commands = cli.commands.filter((command) => {
    if (command.name) {
      return !command.name.startsWith("@@") && command.name !== "interactive";
    }
    return false;
  });

  const commandMap = new Map<string, typeof commands[number]>();
  const res = await prompt<{ command: string }>({
    type: "autocomplete",
    name: "command",
    message: "选择要执行的命令：",
    choices: commands.map((command) => {
      commandMap.set(command.name, command);
      return {
        name: command.name,
        value: command.name,
        message: command.description,
        hint: `等同命令 ${cli.name} ${command.name}`,
      };
    }),
  });
  const command = commandMap.get(res.command);
  if (!command) {
    log.error("未找到命令 %s", res.command);
    return;
  }
  command.commandAction?.apply(cli, args);
};
