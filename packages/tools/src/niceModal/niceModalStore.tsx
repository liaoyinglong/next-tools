import {
  reducer,
  type NiceModalAction,
  type NiceModalStore,
} from "@ebay/nice-modal-react";
import { createStore } from "../store";

export const niceModalStore = createStore({
  name: "niceModalStore",
  state: {
    modals: {} as NiceModalStore,
  },
  actionsCreator: (state) => {
    return {
      dispatch(action: NiceModalAction) {
        state.modals = reducer(state.modals, action);
      },
      /**
       * 为了让 modal 第一次打开的时候过渡动画存在
       * 目前主要是兼容 mantine ui，它们使用的是 css 动画
       * 要确保 dom 存在
       */
      async initModal(id: string) {
        if (state.modals[id]) {
          return;
        }
        state.modals = {
          ...state.modals,
          [id]: {
            id,
            visible: false,
            delayVisible: false,
          },
        };
        // 确保下一帧调用，让 过渡动画有效果
        return Promise.resolve();
      },
    };
  },
});
