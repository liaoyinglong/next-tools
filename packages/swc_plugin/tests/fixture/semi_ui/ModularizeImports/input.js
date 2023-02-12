import { Input, Space as SemiUiSpace } from "@douyinfe/semi-ui";
import { LocaleProvider } from "@douyinfe/semi-ui";

function App() {
  return (
    <LocaleProvider>
      <Input />
      <SemiUiSpace />
    </LocaleProvider>
  );
}
