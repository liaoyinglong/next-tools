import { useFormApi as useFormApi2 } from "@douyinfe/semi-ui/lib/es/form";
import { Layout } from "@douyinfe/semi-ui/lib/es/layout";
import { Col } from "@douyinfe/semi-ui/lib/es/grid";
import { Row } from "@douyinfe/semi-ui/lib/es/grid";
import { ArrayField } from "@douyinfe/semi-ui/lib/es/form";
import { withField } from "@douyinfe/semi-ui/lib/es/form";
import { withFormApi } from "@douyinfe/semi-ui/lib/es/form";
import { withFormState } from "@douyinfe/semi-ui/lib/es/form";
import { useFieldState } from "@douyinfe/semi-ui/lib/es/form";
import { useFieldApi } from "@douyinfe/semi-ui/lib/es/form";
import { useFormState } from "@douyinfe/semi-ui/lib/es/form";
import { useFormApi } from "@douyinfe/semi-ui/lib/es/form";
import { Form } from "@douyinfe/semi-ui/lib/es/form";
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
