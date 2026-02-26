[English](./faq.md) | [中文](./faq.zh-CN.md)

# FAQ — 故障排除

VibeLab 常见的安装和运行问题，采用**问题 → 原因 → 解决方案**格式。另请参阅[快速入门](./quickstart.zh-CN.md)和[配置参考](./configuration.zh-CN.md)。

---

## 1. `posix_spawnp failed` — bash 不在 PATH 中

**问题：** Shell 标签页崩溃，显示 `posix_spawnp failed` 或 `spawn bash ENOENT` 错误。

**解决方案：** 尝试重新编译原生模块。在项目根目录下执行：

```sh
npm rebuild node-pty --build-from-source
```

这将强制重新编译 `node-pty` 二进制文件，可解决因依赖缺失或配置异常导致的问题。

---

## 2. `npm install` 在 `better-sqlite3` 处失败（`'climits' file not found` / Node 25）

**问题：** `npm install` 在编译 `better-sqlite3` 时失败，常见日志包括：

- `prebuild-install warn install No prebuilt binaries found (target=25.x ...)`
- `fatal error: 'climits' file not found`

**原因：** 该项目依赖的原生模块主要针对 Node LTS 版本。使用 Node 25 时可能出现编译失败。

**解决方案：** 切换到 Node 22（本仓库推荐），然后重新安装依赖。

```sh
# 使用 nvm
nvm install 22
nvm use 22
node -v

# 重新安装依赖
npm install
```

如果你不使用 `nvm`，可以用系统包管理器安装 Node 22（例如 macOS 上的 Homebrew），确保其在 `PATH` 中优先，然后再执行 `npm install`。

---

## 3. `npm run dev` 报错 `Cannot find module @rollup/rollup-darwin-arm64`

**问题：** 执行 `npm run dev` 后立即退出，Vite 报错：

- `Cannot find module @rollup/rollup-darwin-arm64`
- `npm has a bug related to optional dependencies`

**原因：** npm 偶尔会漏装与平台相关的 Rollup 可选依赖包。

**解决方案：** 手动安装缺失包后重新启动。

```sh
npm install @rollup/rollup-darwin-arm64
npm run dev
```

如果仍然失败，建议在 Node 22 环境下清理并重装依赖。
