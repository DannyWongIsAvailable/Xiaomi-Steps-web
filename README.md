# Xiaomi Steps Web

一个基于 Vue 3 + Vite + Cloudflare Pages Functions 的 Zepp Life 步数工具。

## 项目定位

本项目是 **Xiaomi-Steps Python 项目的 Web 化版本**。

如果你希望了解核心 API 调用逻辑、命令行运行方式或进行二次开发，可以查看：

👉 **Xiaomi-Steps (Python CLI)**

https://github.com/DannyWongIsAvailable/Xiaomi-Steps.git

对应关系：

```text
Xiaomi-Steps
    Python CLI
    API核心逻辑

        ↓

Xiaomi-Steps-web
    Vue 3 Web UI
    Cloudflare Pages Functions
    在线使用
```

---

## Online Demo

访问地址：

https://xiaomi-steps-web.pages.dev/

---

## Open Source

本项目已开源：

https://github.com/DannyWongIsAvailable/Xiaomi-Steps-web.git

---

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

---

## Features

- 浏览器直接使用
- Vue 3 + Vite
- Cloudflare Pages Functions
- 无需用户安装 Python
- 支持 Git 自动部署
- 登录 Token 获取和步数提交

---

## Project Structure

```text
.
├── functions/
│   └── api/
│       └── steps.js
├── src/
│   ├── components/
│   │   └── StepsTool.vue
│   ├── api/
│   │   └── huami.js
│   ├── App.vue
│   └── main.js
```

---

## Development

```bash
pnpm install
pnpm build
```

Cloudflare Pages:

```text
Framework preset: Vue
Build command: pnpm build
Build output directory: dist
Root directory: /
```

---

## Deployment

项目通过 Cloudflare Pages Git Integration 自动部署。

提交代码到 main 分支后，Cloudflare 会自动完成构建并部署 Pages Functions。

---

## Privacy

账号密码仅用于当前请求，不会写入浏览器本地存储，也不会被项目主动持久化保存。

---

## License

[LICENSE](LICENSE)
仅供学习和技术研究使用，请遵守相关平台服务协议。
