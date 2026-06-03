function _selector_({ user }) {
  return {
    user,
  };
}
export const VerifyPhoneNumberModal = createModal((props) => {
  const { user } = authStore.useShallowSnapshot(_selector_);

  return (
    <button
      type='button'
      disabled={resendOTPMutation.isPending}
      onClick={() =>
        user?.id &&
        passcodeId &&
        resendOTPMutation.mutate({
          customerId: user?.customerId,
          passcodeId,
        })
      }
    >
      Re-send code
    </button>
  );
});
