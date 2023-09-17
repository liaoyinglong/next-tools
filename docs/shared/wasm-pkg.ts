import * as wasm from "@/shared/wasm-pkg/s_wasm";
const initPromise = wasm.default();

export const loadWasm = async () => {
  await initPromise;
  return wasm;
};
