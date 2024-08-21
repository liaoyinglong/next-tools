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

  return <div>actionMap[actionType]</div>;
}
