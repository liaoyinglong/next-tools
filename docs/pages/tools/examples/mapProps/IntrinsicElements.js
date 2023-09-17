import { mapProps } from "@dune2/tools/src/factory/mapProps";

export const MappedDiv1 = mapProps("div", {
  style: {
    color: "red",
  },
});

export const MappedDiv2 = mapProps("div", (p) => {
  return {
    ...p,
    style: {
      color: "red",
      fontSize: 20,
    },
  };
});
