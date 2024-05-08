import {
  reducer,
  type NiceModalAction,
  type NiceModalStore,
} from "@ebay/nice-modal-react";
import { proxy } from "../valtio";

export const niceModalStore = proxy(
  {
    modals: {} as NiceModalStore,
    dispatch(action: NiceModalAction) {
      niceModalStore.modals = reducer(niceModalStore.modals, action);
    },
    /**
     * 为了让 modal 第一次打开的时候过渡动画存在
     * 目前主要是兼容 mantine ui，它们使用的是 css 动画
     * 要确保 dom 存在
     */
    async initModal(id: string) {
      if (niceModalStore.modals[id]) {
        return;
      }
      niceModalStore.modals = {
        ...niceModalStore.modals,
        [id]: {
          id,
          visible: false,
          delayVisible: false,
        },
      };
      // 确保下一帧调用，让 过渡动画有效果
      return Promise.resolve();
    },
  },
  {
    name: "niceModalStore",
  },
);
