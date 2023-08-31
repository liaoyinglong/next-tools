/**
 * @template {import('@dune2/cli').Config} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('@dune2/cli').Config}}
 */
function defineConfig(config) {
  return config;
}
module.exports = defineConfig({
  i18n: [
    {
      i18nDir: "./src/i18n",
      sheetId:
        "https://docs.google.com/spreadsheets/d/1_xpkDxAfKDcyvFwXyELN4vlweSbO0DnClOk_TVHNjWw/edit#gid=971638239",
      sheetRange: "资金记录",
      position: {
        key: "B",
        zh: "C",
        en: "D",
        in: "F",
      },
      include: ["./src/pages/**/*.{js,jsx,ts,tsx}"],
      defaultLocale: "zh",
      namespace: {
        login: ["./src/pages/login"],
        user: ["./src/pages/user"],
      },
    },
    {
      i18nDir: "./src/i18n2",
      sheetId:
        "https://docs.google.com/spreadsheets/d/1_xpkDxAfKDcyvFwXyELN4vlweSbO0DnClOk_TVHNjWw/edit#gid=971638239",
      sheetRange: "资金记录2",
      position: {
        key: "B",
        zh: "C",
        en: "D",
        in: "F",
      },
      include: ["./src/pages/**/*.{js,jsx,ts,tsx}"],
    },
  ],
  api: [
    {
      swaggerJSONPath: "http://192.168.104.10:31082/v1/admin/v3/api-docs",
      swaggerUiUrl:
        "http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API",
      output: "./src/apis",
    },
    {
      swaggerJSONPath:
        "https://test-kiwi-user-api.cyra.exchange/v1/spot-order/v3/api-docs",
      swaggerUiUrl:
        "https://test-kiwi-user-api.cyra.exchange/swagger/?urls.primaryName=service-spot-order",
      output: "apis2",
      urlTransformer: "/v1/order",
    },
  ],
});
