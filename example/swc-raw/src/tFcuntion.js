// const swc = require("@swc/core");
//
// swc
//   .transform(
//     "t`Refresh ${name} inbox`;\n" + " <Trans>Attachment  saved.</Trans>;",
//     {
//       // Some options cannot be specified in .swcrc
//       filename: "input.jsx",
//       // sourceMaps: true,
//       // Input files are treated as module by default.
//
//       jsc: {
//         parser: {
//           syntax: "ecmascript",
//           jsx: true,
//         },
//         transform: {
//           react: {
//             runtime: "automatic",
//             development: true,
//           },
//         },
//         target: "es2015",
//         experimental: {
//           plugins: [
//             [
//               require.resolve("@scope/swc-plugin"),
//               {
//                 /* options */
//               },
//             ],
//           ],
//         },
//       },
//     }
//   )
//   .then((output) => {
//     console.log(output.code);
//   });

let code = "";
// code += 'import fs from "fs";\n';
// code += `console.log(Trans,t);`;
code += " <Trans>Attachment  saved.</Trans>;";
code += "\n t`work`";
const swc = require("@swc/core");

swc
  .transform(code, {
    filename: "input.jsx",
    module: {
      type: "commonjs",
    },
    jsc: {
      parser: {
        syntax: "ecmascript",
        jsx: true,
      },
      target: "es5",
      transform: {
        react: { runtime: "automatic", development: true },
      },
      experimental: {
        plugins: [[require.resolve("@scope/swc-plugin"), {}]],
      },
    },
  })
  .then((output) => {
    console.log(output.code);
  });
