// fix ssg
const initPromise = process.browser
  ? import("@/shared/wasm-pkg/s_wasm").then((wasm) => {
      return wasm.default();
    })
  : Promise.resolve();

export const loadWasm = async () => {
  await initPromise;
  return await import("@/shared/wasm-pkg/s_wasm");
};
