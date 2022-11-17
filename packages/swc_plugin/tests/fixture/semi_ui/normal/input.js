import {
  cssClasses,
  strings,
} from "@douyinfe/semi-foundation/lib/es/button/constants";
const prefixCls = cssClasses.PREFIX;
require("@douyinfe/semi-foundation/lib/es/button/constants");

// 实现 semi ui webpack omit css 功能
// 核心逻辑 semi-omit-css-loader.ts
// 去除 semi 相关库中对 css 的引用
// 如下都需要删除掉
import "@douyinfe/semi-foundation/lib/es/button/button.css";
require("@douyinfe/semi-foundation/lib/cjs/badge/badge.css");
import "../styles/icons.css";
require("../styles/icons.css");
