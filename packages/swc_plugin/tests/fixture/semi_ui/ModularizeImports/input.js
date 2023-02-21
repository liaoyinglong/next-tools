import { Input, Space as SemiUiSpace } from "@douyinfe/semi-ui";
import { LocaleProvider } from "@douyinfe/semi-ui";
import { IconHome, IconEmoji, IconSpin } from "@douyinfe/semi-icons";

function App() {
  return (
    <LocaleProvider>
      <Input />
      <SemiUiSpace />
      <IconHome></IconHome>
      <IconEmoji></IconEmoji>
      <IconSpin></IconSpin>
    </LocaleProvider>
  );
}
