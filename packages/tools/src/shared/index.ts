import { useEffect, useLayoutEffect } from "react";

export const isServer = typeof window === "undefined";
export const isBrowser = !isServer;

export const useIsomorphicLayoutEffect = isBrowser
  ? useLayoutEffect
  : useEffect;
