// @ts-nocheck
export function App(props) {
  const isMobile = useIsMobile();
  return (
    <div
      onClick={async () => {
        if (isMobile) {
          const { LeverageModal } = await import("./LeverageModal");
          LeverageModal.show();
        } else {
          console.log("hello");
        }
      }}
    >
      hello
    </div>
  );
}
