import { useContextValue } from "./shared";

export function ChildA() {
  const { increment } = useContextValue();
  return <button onClick={increment}>increment</button>;
}
export function ChildB() {
  const { count } = useContextValue();
  return <div>count: {count}</div>;
}
