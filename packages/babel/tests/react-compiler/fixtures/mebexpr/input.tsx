// @ts-nocheck
function ActionTypeSelect(props: {
  actionType: ActionType;
  setActionType: (v: ActionType) => void;
}) {
  const { actionType, setActionType } = props;
  const t = useT();

  const actionMap = {
    // object 的 key 是 expr 或者是 number
    [ActionType.Add]: t`trade.Add`,
    [ActionType.Remove]: t`trade.Remove`,

    1: t`trade.Add`,
    2: t`trade.Remove`,
  };

  const renderLink = (txid?: string, layerZero = props.layerZero) => {
    if (!txid) {
      return "-";
    }
  };

  return (
    <div>
      <div>actionMap[actionType]</div>
      <div>{renderLink(props.txid)}</div>
    </div>
  );
}
