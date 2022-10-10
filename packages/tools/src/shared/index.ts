import { useEffect, useLayoutEffect } from "react";

export const isServer = typeof window === "undefined";
export const isBrowser = !isServer;

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;
