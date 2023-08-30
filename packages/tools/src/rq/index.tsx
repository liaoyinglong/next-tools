import { QueryClientProvider as Raw } from "@tanstack/react-query";
import { mapProps } from "../factory/mapProps";
import { queryClient } from "./defaultQueryClient";

export const QueryClientProvider = mapProps(Raw, {
  client: queryClient,
});
