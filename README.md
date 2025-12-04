<div align="center">

**简体中文** | [English](README_EN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md)

# 📅 CalendarDiary - 日历日记

<p align="center">
  <img src="logo.png" alt="CalendarDiary Logo" width="120" height="120">
</p>

**一款简洁优雅的日历日记应用，帮助你记录每天的点滴生活**

[![Version](https://img.shields.io/badge/version-0.2.0--beta-blue.svg)](https://github.com/trustdev-org/calendar-diary/releases)
[![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/trustdev-org/calendar-diary/releases)

[📥 下载应用](#-下载安装) • [✨ 使用方法](#-使用方法) • [🚀 开发指南](#-开发指南) • [📝 更新日志](CHANGELOG.md)

</div>

---

## 📖 软件介绍

CalendarDiary 是一款跨平台的桌面日历日记应用，采用现代化设计理念，为用户提供简洁直观的记录体验。

### 软件界面展示

<img src="./img-preview-1.png"/>

<img src="./img-preview-2.png"/>

### 如何写入内容

<img src="./img-how-to-use-1.gif"/>

### 如何切换月份

<img src="./img-how-to-use-2.gif"/>

### ✨ 核心特色

- **🎯 简洁设计** - 极简界面，专注于内容本身
- **📝 灵活记录** - 支持多行文本，记录待办事项与日记
- **🎨 心情贴纸** - 丰富的表情符号，记录每日心情
- **📊 月度视图** - 清晰的月历布局，一览全月安排
- **☁️ 云端同步** - 支持 WebDAV 云同步，多设备数据同步
- **🔒 隐私保护** - 支持 PIN 码和 TOTP 验证保护
- **💾 本地存储** - 数据完全本地化，保护隐私安全
- **🌍 多语言支持** - 支持简中、繁中、英语、日语、韩语、俄语

## ⭐️ Stars 

[![Star History Chart](https://api.star-history.com/svg?repos=trustdev-org/calendar-diary&type=date&legend=top-left)](https://www.star-history.com/#trustdev-org/calendar-diary&type=date&legend=top-left)

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19.2.0 | UI 框架 |
| **TypeScript** | 5.8.2 | 类型安全 |
| **Electron** | 39.2.3 | 桌面应用框架 |
| **Vite** | 6.4.1 | 构建工具 |
| **Tailwind CSS** | 4.1.8 | 样式框架 |
| **date-fns** | 4.1.0 | 日期处理 |
| **Lucide React** | 0.469.0 | 图标库 |
| **webdav** | 5.8.0 | WebDAV 客户端 |

## 📥 下载安装

### 最新版本：v0.2.0-beta

前往 [Releases](https://github.com/trustdev-org/calendar-diary/releases) 页面下载适合你系统的安装包：

| 平台 | 文件类型 | 说明 |
|------|----------|------|
| 🪟 **Windows** | `.exe` (NSIS 安装器) | 支持自定义安装路径 |
| 🪟 **Windows** | `.exe` (便携版) | 无需安装，解压即用 |
| 🍎 **macOS** | `.dmg` | 适用于 Apple Silicon (M1/M2/M3) |
| 🐧 **Linux** | `.AppImage` | 通用 Linux 应用格式 |
| 🐧 **Linux** | `.deb` | Debian/Ubuntu 系统 |

### 安装说明

#### Windows
1. 下载 `CalendarDiary-Setup-0.2.0-beta.exe`
2. 双击运行安装程序
3. 按照向导完成安装

#### macOS
1. 下载 `CalendarDiary-0.2.0-beta-arm64.dmg`
2. 打开 DMG 文件
3. 将应用拖入 Applications 文件夹
4. 首次运行可能需要在"系统设置 > 隐私与安全性"中允许

#### Linux
```bash
# AppImage 方式
chmod +x CalendarDiary-0.2.0-beta-arm64.AppImage
./CalendarDiary-0.2.0-beta-arm64.AppImage

# Debian/Ubuntu 方式
sudo dpkg -i calendar-diary_0.2.0-beta_amd64.deb
```

## 📖 使用方法

### 基本操作

#### 1️⃣ 查看日历
- 启动应用后，默认显示当月日历
- 点击左右箭头切换月份
- 点击日期数字快速跳转到指定日期

#### 2️⃣ 记录日记/待办
1. 点击任意日期格子
2. 在弹出的编辑器中输入内容
3. 每条记录可以：
   - 📝 输入多行文本
   - 😊 选择表情符号标记
   - 🗑️ 点击删除图标移除
4. 点击"保存更改"完成记录

#### 3️⃣ 添加心情贴纸
- 在日期编辑器底部选择心情贴纸
- 支持多个贴纸同时添加
- 再次点击可取消选择

#### 4️⃣ 月度计划
- 在日历顶部区域记录本月目标
- 支持 3 条独立的计划条目
- 计划会自动保存

### 高级功能

#### 📦 数据备份与恢复

**导出备份：**
1. 点击右上角设置图标 ⚙️
2. 选择"导出备份"
3. 选择保存位置，文件名格式：`paperplan_backup_YYYY-MM-DD.json`

**导入备份：**
1. 点击右上角设置图标 ⚙️
2. 选择"导入备份"
3. 选择之前导出的 JSON 文件
4. 确认导入后数据将恢复

#### 🌍 切换语言
1. 点击设置图标 ⚙️
2. 在"语言"下拉菜单中选择
3. 语言会立即切换，无需重启

#### 📂 查看数据位置
1. 点击设置图标 ⚙️
2. 在"数据位置"区域点击"打开文件夹"
3. 系统会打开数据存储目录

**数据存储路径：**
- Windows: `%APPDATA%\CalendarDiary\`
- macOS: `~/Library/Application Support/CalendarDiary/`
- Linux: `~/.config/CalendarDiary/`

#### 🔄 软件更新
- 点击工具栏「检查更新」按钮
- 如有新版本，会显示版本信息和发布页链接
- 点击链接前往下载页下载最新版本

#### ☁️ 云同步设置
1. 点击设置图标 ⚙️
2. 选择「云同步」标签页
3. 配置 WebDAV 服务器地址、路径、用户名和密码
4. 点击「测试连接」验证配置
5. 点击工具栏云图标打开同步管理界面

## 🚀 开发指南

### 环境要求

- **Node.js**: 18.x 或更高版本
- **npm**: Node.js 自带的包管理器
- **操作系统**: Windows 10+, macOS 10.13+, Linux

### 克隆项目

```bash
git clone https://github.com/trustdev-org/calendar-diary.git
cd calendar-diary
```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将：
1. 启动 Vite 开发服务器（端口 5173）
2. 自动启动 Electron 应用
3. 支持热重载（HMR）

### 构建打包

#### 构建所有平台

```bash
npm run electron:build
```

#### 构建特定平台

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux
```

构建产物输出到 `release/` 目录。


### 技术架构

#### Electron 架构
- **主进程** (`electron/main.ts`): 管理应用窗口、文件系统、自动更新
- **渲染进程** (React App): 用户界面和交互逻辑
- **预加载脚本** (`electron/preload.ts`): 安全的 IPC 通信桥接

#### 数据存储
所有数据保存在本地文件系统：
- **calendar-data.json**: 日记和待办事项数据
- **monthly-plans.json**: 月度计划数据

存储位置：
- **Windows**: `%APPDATA%\CalendarDiary\`
- **macOS**: `~/Library/Application Support/CalendarDiary/`
- **Linux**: `~/.config/CalendarDiary/`


## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 提交 Issue
- 使用清晰的标题描述问题
- 提供详细的复现步骤
- 附上系统信息和错误日志

### 提交 Pull Request
1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 开启 Pull Request

## 📄 许可证

本项目采用 [CC-BY-NC-4.0](LICENSE) 许可证。

**您可以：**
- ✅ 分享 - 复制和再分发
- ✅ 修改 - 重新混合、转换和基于此构建

**条件：**
- 📝 署名 - 必须给出适当的署名
- 🚫 非商业性使用 - 不得用于商业目的

## 🙏 致谢

- 图标库：[Lucide Icons](https://lucide.dev/)
- UI 框架：[React](https://react.dev/)
- 桌面框架：[Electron](https://www.electronjs.org/)
- 日期处理：[date-fns](https://date-fns.org/)

## 📮 联系方式

- **问题反馈**: [GitHub Issues](https://github.com/trustdev-org/calendar-diary/issues)
- **项目主页**: [GitHub Repository](https://github.com/trustdev-org/calendar-diary)

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star！**

Made with ❤️ by TrustDev

</div>