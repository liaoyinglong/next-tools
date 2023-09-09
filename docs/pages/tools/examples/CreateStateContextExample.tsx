import { LiveCode } from "../../../components/LiveCode";

export function CreateStateContextExample() {
  // language=JSX
  const app = `export default function App() {
  return (
    <h1>Hello World</h1>
  );
}`;

  return (
    <LiveCode
      files={{
        "/App.js": app,
      }}
    />
  );
}
