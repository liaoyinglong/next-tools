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
export { niceModalStore };

export function NiceModalProvider(props: PropsWithChildren) {
  const { modals } = niceModalStore.useSnapshot();

  return (
    <Provider dispatch={niceModalStore.dispatch} modals={modals}>
      {props.children}
    </Provider>
  );
}
