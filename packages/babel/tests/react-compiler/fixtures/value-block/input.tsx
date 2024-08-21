// @ts-nocheck
export function App(props) {
  const { tableType, openOrderColumns } = props;
  const isMobile = useIsMobile();
  return (
    <div>
      {isMobile && (
        <div className="ml-auto">
          {(() => {
            switch (tableType) {
              case TableType.OpenOrder:
                return openOrderColumns?.find((item) => item.key === "action")
                  ?.title;
              default:
                return null;
            }
          })()}
        </div>
      )}
    </div>
  );
}
