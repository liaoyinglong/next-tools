import connect from "connect";
import open from "open";
import { URL } from "url";
import { createLogger } from "../index";

const log = createLogger("google:shared");

function openBrowser(url: string) {
  log.info(`如未自动打开浏览器，可访问以下地址：${url}`);
  open(url, { app: { name: open.apps.chrome } });
}

export function openAndWaitReturnQuery(
  toOpenUrl: string,
  port: number,
  queryKey: string
) {
  return new Promise<string>((resolve) => {
    openBrowser(toOpenUrl);

    const app = connect();
    app.use((req, res, next) => {
      const parsedUrl = new URL(req.url, `http://localhost:${port}`);
      const target = parsedUrl.searchParams.get(queryKey);
      if (target) {
        res.writeHead(200, {
          "content-type": "text/html;charset=utf8",
        });
        res.end(
          `<div>当前窗口可直接关闭</div>
                  <script>
                    window.open("", "_self", "");
                    window.close();
                  </script>`
        );
        server.close();
        server.unref();
        resolve(target);
      }
      next();
    });

    const server = app.listen(port);
  });
}
