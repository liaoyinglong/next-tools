export async function extract() {
  const { extract } = await import("@scope/wasm");
  console.log(extract);
}
