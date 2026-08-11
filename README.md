# Xiaomi Steps Web

一个基于 Vue 3 + Vite + Cloudflare Pages Functions 的 Zepp Life 步数工具。

## Online Demo

访问地址：

https://xiaomi-steps-web.pages.dev/

## Open Source

本项目已开源：

https://github.com/DannyWongIsAvailable/Xiaomi-Steps-web.git

## Architecture

浏览器不直接请求 Huami API，而通过 Cloudflare Pages Function 转发：

```text
Browser
   ↓
/api/steps
   ↓
Cloudflare Pages Function
   ↓
Huami API
```

这样避免浏览器 CORS 限制。

## Project Structure

```text
.
├── functions/
│   └── api/
│       └── steps.js       # Cloudflare Pages Function
├── src/
│   ├── components/
│   │   └── StepsTool.vue  # 页面业务组件
│   ├── api/
│   │   └── huami.js      # 前端 API 调用层
│   ├── App.vue
│   └── main.js
```

## Development

Install dependencies:

```bash
pnpm install
```

Build:

```bash
pnpm build
```

Cloudflare Pages configuration:

```text
Framework preset: Vue
Build command: pnpm build
Build output directory: dist
Root directory: /
```

## Deployment

项目通过 Cloudflare Pages Git Integration 自动部署。

提交代码到 main 分支后，Cloudflare 会自动完成构建并部署 Pages Functions。

## Privacy

账号密码仅用于当前请求，不会写入浏览器本地存储，也不会被项目主动持久化保存。

## License

仅供学习和技术研究使用，请遵守相关平台服务协议。
