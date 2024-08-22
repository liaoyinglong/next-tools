// @ts-nocheck
export function Test() {
  return (
    <div
      onClick={() => {
        try {
          throw new Error("error");
        } catch (e) {
          console.log(e);
        } finally {
          console.log("finally");
        }
      }}
    >
      test
    </div>
  );
}
