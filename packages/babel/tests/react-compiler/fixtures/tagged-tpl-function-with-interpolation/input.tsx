// @ts-nocheck

function App(props) {
  const [state, setState] = useState();
  const t = useT();

  // tagged template function call with interpolation
  return <div>{t`hello ${props.name}`}</div>;
}
