import { spawn } from 'node:child_process';
import { createLogger } from '../../shared';
import type { ApiConfig } from '../../shared/config';

const log = createLogger('generateApi');

const FORMATTER_ARGUMENT_PATTERN = /"([^"]*)"|'([^']*)'|(\S+)/g;

function parseFormatterCommand(command: string) {
  const args = [...command.matchAll(FORMATTER_ARGUMENT_PATTERN)]
    .map((match) => match[1] ?? match[2] ?? match[3] ?? '')
    .filter(Boolean);
  const [file, ...rest] = args;
  if (!file) {
    throw new Error('codeFormatterCmd is empty');
  }
  return { file, args: rest };
}

async function runFormatter(command: string, outputDir: string) {
  const { file, args } = parseFormatterCommand(command);
  await new Promise<void>((resolve, reject) => {
    const child = spawn(file, [...args, outputDir], {
      shell: false,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          signal
            ? `formatter exited with signal ${signal}`
            : `formatter exited with code ${code}`,
        ),
      );
    });
  });
}

/**
 * 生成完成后执行用户配置的格式化命令（如 oxfmt），返回是否成功
 */
export async function runCodeFormatter(apiConfig: ApiConfig): Promise<boolean> {
  if (!apiConfig.codeFormatterCmd) {
    return true;
  }
  try {
    await runFormatter(apiConfig.codeFormatterCmd, apiConfig.output!);
    log.info(`Code formatting success`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Code formatting failed: ${message}`);
    return false;
  }
}
