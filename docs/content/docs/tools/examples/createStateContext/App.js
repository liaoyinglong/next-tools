import { ChildA, ChildB } from "./Child";
import { Provider } from "./shared";

export default function App() {
  return (
    <Provider>
      <ChildA></ChildA>
      <ChildB></ChildB>
    </Provider>
  );
}
