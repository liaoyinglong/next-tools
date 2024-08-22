// @ts-nocheck

function BigIntTest(props) {
  const hasPendingClaim = (props?.pendingWithdrawalBalance ?? 0n) > 0n;

  const hasPendingClaim2 =
    (props?.pendingWithdrawalBalance ?? BigInt(0)) > BigInt(0);

  return <div>{hasPendingClaim && <div>hasPendingClaim</div>}</div>;
}
