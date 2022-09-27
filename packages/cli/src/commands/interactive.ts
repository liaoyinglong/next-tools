import { cli, createLogger } from "../shared";
import prompts from "prompts";

const log = createLogger("interactive");

export const interactive = async (args: any) => {
  const commands = cli.commands.filter((command) => {
    if (command.name) {
      return !command.name.startsWith("@@") && command.name !== "interactive";
    }
    return false;
  });

  const commandMap = new Map<string, typeof commands[number]>();
  const res = await prompts({
    type: "select",
    name: "command",
    message: "选择要执行的命令：",
    choices: commands.map((command) => {
      commandMap.set(command.name, command);
      return {
        title: command.name,
        value: command.name,
        description: command.description,
      };
    }),
  });

  const command = commandMap.get(res.command);
  if (!command) {
    log.error("未找到命令 %s", res.command);
    return;
  }
  command.commandAction.apply(cli, args);
};
