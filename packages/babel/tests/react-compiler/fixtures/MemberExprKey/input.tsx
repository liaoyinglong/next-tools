// @ts-nocheck
function ActionTypeSelect(props: {
  actionType: ActionType;
  setActionType: (v: ActionType) => void;
}) {
  const { actionType, setActionType } = props;
  const t = useT();

  const actionMap = {
    [ActionType.Add]: t`trade.Add`,
    [ActionType.Remove]: t`trade.Remove`,
  };

  return <div>actionMap[actionType]</div>;
}
