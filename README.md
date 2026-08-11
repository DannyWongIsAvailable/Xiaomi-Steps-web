# Xiaomi Steps Web

Vue 3 + Vite + Cloudflare Pages Functions 版本。

## 工作方式

浏览器不再直接跨域请求 Huami：

```text
Browser -> /api/steps -> Cloudflare Pages Function -> Huami API
```

因此可以避开浏览器对 Huami API 的 CORS 限制。

## 开发依赖

```bash
pnpm install
```

## 构建

```bash
pnpm build
```

Cloudflare Pages 建议配置：

```text
Framework preset: Vue
Build command: pnpm build
Build output directory: dist
Root directory: /
```

项目根目录中的 `functions/` 会被 Cloudflare Pages 自动识别，`functions/api/steps.js` 对应线上接口：

```text
POST /api/steps
```

无需单独部署服务器，也无需数据库。

## 本地测试说明

普通的：

```bash
pnpm dev
```

只会启动 Vite 前端，不会运行 Cloudflare Pages Functions，所以本地点击“修改步数”会访问不到 `/api/steps`。

最简单的验证方式是直接部署到 Cloudflare Pages 后测试。

如果需要在本地同时测试 Pages Functions，可安装 Wrangler 后使用 Cloudflare 的 Pages 本地开发命令。

## 隐私

账号和密码由页面通过 HTTPS POST 发送给当前站点的 `/api/steps`，Function 仅在当前请求中用于调用 Huami API。本项目代码不会主动把账号、密码、Token 写入浏览器存储、数据库或 KV。

## 免责声明

仅用于学习和技术研究。请遵守 Zepp Life / Huami 的相关服务协议。
