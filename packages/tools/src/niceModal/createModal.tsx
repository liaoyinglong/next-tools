import NiceModal from "@ebay/nice-modal-react";
import _ from "lodash";
import { niceModalStore } from "./niceModalStore";

export const createModal = <P extends object, Res = unknown>(
  Comp: React.ComponentType<P>,
) => {
  const customModal = NiceModal.create(Comp);

  const modalId: string = _.uniqueId("niceModal_");

  NiceModal.register(modalId, customModal);
  return Object.assign(customModal, {
    async show(props?: P): Promise<Res> {
      await niceModalStore.actions.initModal(modalId);
      return NiceModal.show(modalId, props);
    },
    hide() {
      return NiceModal.hide(modalId);
    },
    remove() {
      return NiceModal.remove(modalId);
    },
    /**
     * 获取当前弹框是否打开
     */
    getVisible() {
      return !!niceModalStore.getState().modals[modalId]?.visible;
    },
  });
};
