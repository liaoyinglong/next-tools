/**
 * @template {import('@dune2/cli').Config} T
 * @param {T | T[]} config - A generic parameter that flows through to the return type
 * @constraint {{import('@dune2/cli').Config}}
 */
function defineConfig(config) {
  return config;
}
module.exports = defineConfig({
  sheetId:
    "https://docs.google.com/spreadsheets/d/1_xpkDxAfKDcyvFwXyELN4vlweSbO0DnClOk_TVHNjWw/edit#gid=1457406092",
  sheetRange: "资金记录",
  position: {
    key: "B",
    zh: "C",
    en: "D",
    in: "F",
  },
});
