//@ts-nocheck

import { tablesStore } from "../store";

export const useHideOtherParis = () => {
  const switchHideOtherPairs = (isHide?: boolean) => {
    tablesStore.isHideOtherPairs = isHide;
  };

  return {
    switchHideOtherPairs,
    isHideOtherPairs,
  };
};
