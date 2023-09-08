import { Sandpack } from "@codesandbox/sandpack-react";

export function CreateStateContextExample() {
  // language=JSX
  const app = `export default function App() {
  return (
    <h1>Hello World</h1>
  );
}`;

  return (
    <Sandpack
      template={"react"}
      theme={"auto"}
      files={{
        "/App.js": app,
      }}
    />
  );
}
