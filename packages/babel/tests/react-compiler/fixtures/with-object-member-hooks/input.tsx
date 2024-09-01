// @ts-nocheck

export function useQuote() {
  // 只存在这种形式的 hooks 方法，不能被 react compiler 识别为 hooks 进行优化
  const { availableSymbols, symbolMap } = symbolStore.useSnapshot();

  // 方案 1：添加一个普通的 useRef(), useRef 调用成本很低
  //  useRef();
  //  方案 2：
  //  在 函数体外面定义 const useSymbolStore  = symbolStore.useSnapshot
  //  调用 useSymbolStore 即可

  return {
    availableSymbols,
    symbolMap,
  };
}
