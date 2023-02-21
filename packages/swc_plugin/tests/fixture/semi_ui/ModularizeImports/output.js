import IconSpin from "@douyinfe/semi-icons/lib/es/icons/IconSpin";
import IconEmoji from "@douyinfe/semi-icons/lib/es/icons/IconEmoji";
import IconHome from "@douyinfe/semi-icons/lib/es/icons/IconHome";
import LocaleProvider from "@douyinfe/semi-ui/lib/es/locale/localeProvider";
import SemiUiSpace from "@douyinfe/semi-ui/lib/es/space";
import Input from "@douyinfe/semi-ui/lib/es/input";
function App() {
    return <LocaleProvider >

      <Input />

      <SemiUiSpace />

      <IconHome ></IconHome>

      <IconEmoji ></IconEmoji>

      <IconSpin ></IconSpin>

    </LocaleProvider>;
}
