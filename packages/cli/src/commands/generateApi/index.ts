import fs from 'node:fs/promises';
import * as os from 'os';
import path from 'path';
import type { OpenAPIV3 } from 'openapi-types';
import pMap from 'p-map';
import { createLogger } from '../../shared';
import { ApiConfig, getConfig } from '../../shared/config';
import { promptApiConfigEnable } from '../../shared/promptConfigEnable';
import { asyncLocalStorage, type SwaggerParseState } from './context';
import { runCodeFormatter } from './formatter';
import { parseSwagger } from './parseSwagger';
import { generateApiRequestCode } from './requestCode';

const log = createLogger('generateApi');

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'patch'] as const;

export { generateApiRequestCode } from './requestCode';
export { asyncLocalStorage } from './context';

function getCodegenConcurrency() {
  const parallelism =
    typeof os.availableParallelism === 'function'
      ? os.availableParallelism()
      : os.cpus().length;
  return Math.max(1, parallelism - 1);
}

function isPathInside(parent: string, child: string) {
  const relative = path.relative(parent, child);
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function resolveOutputDir(cwd: string, output: string) {
  const resolvedCwd = path.resolve(cwd);
  const resolvedOutput = path.resolve(resolvedCwd, output);
  if (!isPathInside(resolvedCwd, resolvedOutput)) {
    throw new Error(`output must be inside cwd: ${output}`);
  }
  return resolvedOutput;
}

function sanitizeOutputSegment(segment: string) {
  const sanitized = segment.replace(/[<>:"\\|?*\u0000-\u001F]/g, '_');
  return sanitized === '.' || sanitized === '..' || sanitized.length === 0
    ? '_'
    : sanitized;
}

export function resolveOperationOutputPath(options: {
  outputDir: string;
  url: string;
  method: string;
  enableTs?: boolean;
}) {
  const outputDir = path.resolve(options.outputDir);
  const urlSegments = options.url
    .split('/')
    .filter(Boolean)
    .map(sanitizeOutputSegment);
  const fileName = `${sanitizeOutputSegment(options.method)}.${
    options.enableTs === false ? 'js' : 'ts'
  }`;
  const outputPath = path.resolve(outputDir, ...urlSegments, fileName);
  if (!isPathInside(outputDir, outputPath)) {
    throw new Error(`operation output escaped output dir: ${options.url}`);
  }
  return outputPath;
}

interface GenerateResult {
  hasPaths: boolean;
  generatedCount: number;
  skippedCount: number;
}

export async function generatePaths(
  apiConfig: ApiConfig,
  state: SwaggerParseState,
): Promise<GenerateResult> {
  const pathEntries = Object.entries(
    (state.parsed as OpenAPIV3.Document).paths ?? {},
  );
  if (!pathEntries.length) {
    log.error('%s 中没有可用的 paths，已跳过', apiConfig.swaggerJSONPath);
    return { hasPaths: false, generatedCount: 0, skippedCount: 0 };
  }

  let generatedCount = 0;
  let skippedCount = 0;
  const codegenConcurrency = getCodegenConcurrency();

  await asyncLocalStorage.run(state, () =>
    pMap(
      pathEntries,
      async ([url, pathItemObject]) => {
        if (!pathItemObject) {
          log.error('路径 %s 未定义 pathItemObject，已跳过', url);
          skippedCount++;
          return;
        }

        log.info('开始生成 %s', url);
        let generatedForUrl = 0;
        await pMap(
          HTTP_METHODS,
          async (method) => {
            const operationObject = pathItemObject[method];
            if (!operationObject) {
              return;
            }

            try {
              const code = await generateApiRequestCode({
                url: url,
                method: method,
                operationObject: operationObject,
                apiConfig,
              });
              const outputPath = resolveOperationOutputPath({
                outputDir: apiConfig.output!,
                url,
                method,
                enableTs: apiConfig.enableTs,
              });
              await fs.mkdir(path.dirname(outputPath), {
                recursive: true,
              });
              await fs.writeFile(outputPath, code);
              generatedCount++;
              generatedForUrl++;
            } catch (error) {
              skippedCount++;
              const message =
                error instanceof Error ? error.message : String(error);
              log.error(
                '%s %s 生成失败：%s',
                method.toUpperCase(),
                url,
                message,
              );
            }
          },
          { concurrency: 1 },
        );
        if (generatedForUrl === 0) {
          log.info('路径 %s 未生成任何方法', url);
        }
      },
      { concurrency: codegenConcurrency },
    ),
  );

  return { hasPaths: true, generatedCount, skippedCount };
}

export async function generateApi() {
  const config = await getConfig();
  const selectedConfigs = await promptApiConfigEnable(config.api);
  const apiConfigs = selectedConfigs.filter((apiConfig) => {
    if (!apiConfig.output) {
      log.error('配置 %s 缺少 output，已跳过', apiConfig.swaggerJSONPath);
      return false;
    }
    return true;
  });
  const skippedConfigCount = selectedConfigs.length - apiConfigs.length;

  if (skippedConfigCount > 0) {
    log.info('由于缺少 output，跳过 %d 个配置', skippedConfigCount);
  }

  if (!apiConfigs.length) {
    log.info('没有需要生成的 API 配置，生成流程结束');
    return;
  }

  log.info('本次将生成 %d 个 API 配置', apiConfigs.length);

  let totalSuccessCount = 0;
  let totalFailedCount = 0;
  const startedAt = Date.now();

  const preparedConfigs: ApiConfig[] = [];
  const cwd = config.cwd ?? process.cwd();

  for (const apiConfig of apiConfigs) {
    log.info('开始初始化输出目录 %s', apiConfig.output);
    const prepareStartedAt = Date.now();
    try {
      const outputDir = resolveOutputDir(cwd, apiConfig.output!);
      await fs.rm(outputDir, { recursive: true, force: true });
      await fs.mkdir(outputDir, { recursive: true });
      preparedConfigs.push({
        ...apiConfig,
        output: outputDir,
      });
      log.info(
        '输出目录 %s 初始化完成，耗时 %dms',
        apiConfig.output,
        Date.now() - prepareStartedAt,
      );
    } catch (error) {
      totalFailedCount++;
      const message = error instanceof Error ? error.message : String(error);
      log.error('初始化输出目录 %s 失败：%s', apiConfig.output, message);
    }
  }

  if (!preparedConfigs.length) {
    log.error('所有配置都初始化失败，生成流程结束');
    log.info(
      'generateApi Done，成功 %d 个，失败 %d 个，总耗时 %dms',
      totalSuccessCount,
      totalFailedCount,
      Date.now() - startedAt,
    );
    return;
  }

  for (const apiConfig of preparedConfigs) {
    let state: SwaggerParseState;
    try {
      state = await parseSwagger(apiConfig);
    } catch (error) {
      totalFailedCount++;
      const message = error instanceof Error ? error.message : String(error);
      log.error('解析 %s 失败：%s', apiConfig.swaggerJSONPath, message);
      continue;
    }

    const result = await generatePaths(apiConfig, state);

    if (!result.hasPaths) {
      totalFailedCount++;
      continue;
    }

    if (!result.generatedCount) {
      log.error('%s 未生成任何请求，已标记失败', apiConfig.swaggerJSONPath);
      totalFailedCount++;
      continue;
    }

    const formatted = await runCodeFormatter(apiConfig);
    if (!formatted) {
      result.skippedCount++;
    }

    log.info(
      '%s 生成完成，共生成 %d 个请求，跳过 %d 个',
      apiConfig.swaggerJSONPath,
      result.generatedCount,
      result.skippedCount,
    );
    totalSuccessCount++;
  }

  log.info(
    'generateApi Done，成功 %d 个，失败 %d 个，总耗时 %dms',
    totalSuccessCount,
    totalFailedCount,
    Date.now() - startedAt,
  );
}
