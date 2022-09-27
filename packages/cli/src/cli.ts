#!/usr/bin/env node
import { extract } from "./commands/extract";
import { cli } from "./shared";
import { version } from "../package.json";
import { interactive } from "./commands/interactive";

cli
  .command("extract", "提取代码中的文案")
  .example("dune extract")
  .action(extract);

cli
  .command("interactive", "交互式操作")
  .example("dune interactive")
  .alias("i")
  .action(interactive);
// make default command run interactive
cli.command("").action(interactive);

cli.version(version);
cli.help();

(async () => {
  try {
    // Parse CLI args without running the command
    cli.parse(process.argv, { run: false });
    // Run the command yourself
    // You only need `await` when your command action returns a Promise
    await cli.runMatchedCommand();
  } catch (error) {
    // Handle error here..
    // e.g.
    // console.error(error.stack)
    // process.exit(1)
  }
})();
