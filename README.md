# 基础网页项目

使用 HTML、CSS 和原生 JavaScript 构建的响应式欢迎页面，无需安装第三方依赖。

## 本地运行

在仓库根目录运行：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

在本地浏览器打开 `http://127.0.0.1:8000`，点击“打个招呼”查看交互效果。按 Ctrl+C 停止服务。

也可直接用浏览器打开 `index.html`。

## 文件说明

- `index.html`：页面结构与无障碍状态提示。
- `styles.css`：响应式布局和样式。
- `script.js`：按钮点击交互。

## 检查

```sh
node --check script.js
```

手动检查窄屏布局、键盘焦点和按钮点击后的欢迎消息。
