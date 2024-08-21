// @ts-nocheck

export const CancelOrderConfirm = createModal(() => {
  const modal = useModal();

  return (
    <Modal
      {...createModal.modalProps(modal)}
      size="375"
      withCloseButton={false}
    >
      <h1>modal</h1>
    </Modal>
  );
});
