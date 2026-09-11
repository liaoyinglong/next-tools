import { AsyncLocalStorage } from 'node:async_hooks';
import type SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export type ParsedDocument = OpenAPIV2.Document | OpenAPIV3.Document;

export interface SwaggerParseState {
  parsed: ParsedDocument;
  parser: SwaggerParser;
}

export const asyncLocalStorage = new AsyncLocalStorage<SwaggerParseState>();
