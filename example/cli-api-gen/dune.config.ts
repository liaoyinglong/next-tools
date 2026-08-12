import { defineConfig } from '@dune2/cli';

export default defineConfig({
  api: [
    {
      output: './src/apis/example',
      swaggerJSONPath: './src/swagger/example.json',
      swaggerUiUrl: 'http://localhost:3000/swagger',
    },
    {
      output: './src/apis/ayshei',
      swaggerJSONPath: './src/swagger/ayshei.json',
      swaggerUiUrl: 'http://localhost:3000/swagger',
    },
    {
      output: './src/apis/ayshei-admin',
      swaggerJSONPath: './src/swagger/ayshei-admin.json',
      swaggerUiUrl: 'http://localhost:3000/swagger',
    },
    {
      output: './src/apis/wma',
      swaggerJSONPath: './src/swagger/wma.json',
      swaggerUiUrl: 'http://localhost:3000/swagger',
    },
    {
      output: './src/apis/swagger',
      swaggerJSONPath: './src/swagger/swagger.json',
      swaggerUiUrl: 'http://localhost:3000/swagger',
    },
    {
      output: './src/apis/elysia',
      swaggerJSONPath: './src/swagger/elysia.json',
      swaggerUiUrl: 'http://localhost:3000/swagger',
    },
    {
      output: './src/apis/elysia2',
      swaggerJSONPath: 'http://localhost:3456/api/openapi/json',
      swaggerUiUrl: 'http://localhost:3000/swagger',
    },
  ],
});
