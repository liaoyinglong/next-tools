#!/usr/bin/env node
import { extract } from "./commands/extract";
import { cli } from "./shared";
import { version } from "../package.json";

cli.command("").action(() => {
  cli.outputHelp();
});

cli.command("extract", "提取代码中的文案").action(extract);

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
