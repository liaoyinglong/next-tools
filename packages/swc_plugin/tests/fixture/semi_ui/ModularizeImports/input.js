import { Input, Space as SemiUiSpace } from "@douyinfe/semi-ui";
import { LocaleProvider } from "@douyinfe/semi-ui";
import { IconHome, IconEmoji, IconSpin } from "@douyinfe/semi-icons";

import {
  Form,
  useFormApi,
  useFormState,
  useFieldApi,
  useFieldState,
  withFormState,
  withFormApi,
  withField,
  ArrayField,
  Row,
  Col,
  Layout,
  useFormApi as useFormApi2,
} from "@douyinfe/semi-ui";

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
