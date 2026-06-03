// useSnapshot inside an arrow function passed as callback argument
export const VerifyPhoneNumberModal = createModal((props) => {
  const { user } = authStore.useSnapshot();

  return (
    <button
      type='button'
      disabled={resendOTPMutation.isPending}
      onClick={() =>
        user?.id &&
        passcodeId &&
        resendOTPMutation.mutate({ customerId: user?.customerId, passcodeId })
      }
    >
      Re-send code
    </button>
  );
});
