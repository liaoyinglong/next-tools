import { mapProps } from "@dune2/tools/factory/mapProps";
import React, { PropsWithChildren } from "react";

function Comp(
  props: PropsWithChildren<{
    style: React.CSSProperties;
  }>
) {
  return <div style={props.style}>{props.children}</div>;
}

export const MappedComp1 = mapProps(Comp, {
  style: {
    color: "red",
  },
});

export const MappedComp2 = mapProps(Comp, (p) => {
  return {
    ...p,
    style: {
      color: "red",
      fontSize: 20,
    },
  };
});
