import { defineConfig } from "@dune2/cli";

export default defineConfig({
  api: [
    {
      output: "./src/apis",
      swaggerJSONPath: "./src/swagger/example.json",
      swaggerUiUrl: "http://localhost:3000/swagger",
    },
  ],
});
