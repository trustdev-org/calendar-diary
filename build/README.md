# 应用图标

请将应用图标文件放在此目录：

- `icon.icns` - macOS 图标（512x512 或更高）
- `icon.ico` - Windows 图标（256x256 或更高）
- `icon.png` - Linux 图标（512x512 或更高）

## 快速生成图标

如果你有一个 PNG 图标文件（至少 512x512），可以使用以下工具转换：

### 在线工具
- https://iconverticons.com/online/
- https://cloudconvert.com/png-to-ico

### 命令行工具
```bash
# 安装 electron-icon-builder
npm install -g electron-icon-builder

# 生成所有平台图标（从 icon.png）
electron-icon-builder --input=./icon.png --output=./build
```

## 临时方案

如果暂时没有图标，构建仍然可以继续，但会使用 Electron 默认图标。
