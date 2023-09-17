import { MappedComp1, MappedComp2 } from "./Component";
import { MappedDiv1, MappedDiv2 } from "./IntrinsicElements";

export default function App() {
  return (
    <>
      <h1>html 内置标签</h1>
      <MappedDiv1>div 1</MappedDiv1>
      <MappedDiv2>div 2</MappedDiv2>

      <h1>自定义组件</h1>
      <MappedComp1>自定义组件1</MappedComp1>
      <MappedComp2>自定义组件2</MappedComp2>
    </>
  );
}
