import { Provider } from "@ebay/nice-modal-react";
import type { PropsWithChildren } from "react";
import { niceModalStore } from "./niceModalStore";

export {
  antdDrawer,
  antdDrawerV5,
  antdModal,
  antdModalV5,
  bootstrapDialog,
  muiDialog,
  muiDialogV5,
  useModal,
} from "@ebay/nice-modal-react";
export { createModal } from "./createModal";
export {
  /**
   * 一般情况下不需要使用这个，这里导出主要是给 storybook 使用，防止弹出多个 modal
   */
  Provider as BaseNiceModalProvider,
  niceModalStore,
};

export function NiceModalProvider(props: PropsWithChildren) {
  const { modals } = niceModalStore.useSnapshot();

  return (
    <Provider dispatch={niceModalStore.actions.dispatch} modals={modals}>
      {props.children}
    </Provider>
  );
}
