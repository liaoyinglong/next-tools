// @ts-nocheck

function App(props) {
  const [state, setState] = useState();

  // 模版字符串中有插槽
  return <div className={`flex ${state}`}>hello</div>;
}
