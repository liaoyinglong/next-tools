import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      // @see https://stackoverflow.com/questions/75538301/reactquery-queryfn-passed-to-usequery-is-never-run-happens-only-on-chrome
      // 在mac上，chrome 浏览器可能会出现没有请求的现象
      // 主要是 navigator.onLine 的值为 false
      // 但是实际上是没有断网的
      networkMode: "always",
    },
    mutations: {
      retry: false,
      networkMode: "always",
    },
  },
});
