<div align="center">

[简体中文](README.md) | [English](README_EN.md) | **繁體中文** | [日本語](README_JA.md) | [한국어](README_KO.md) | [Русский](README_RU.md)

# 📅 CalendarDiary - 日曆日記

<p align="center">
  <img src="logo.png" alt="CalendarDiary Logo" width="120" height="120">
</p>

**一款簡潔優雅的日曆日記應用，幫助你記錄每天的點滴生活**

[![Version](https://img.shields.io/badge/version-0.2.0--beta-blue.svg)](https://github.com/trustdev-org/calendar-diary/releases)
[![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/trustdev-org/calendar-diary/releases)

[📥 下載應用](#-下載安裝) • [✨ 使用方法](#-使用方法) • [🚀 開發指南](#-開發指南) • [📝 更新日誌](CHANGELOG.md)

</div>

---

## 📖 軟體介紹

CalendarDiary 是一款跨平台的桌面日曆日記應用，採用現代化設計理念，為使用者提供簡潔直觀的記錄體驗。

### 軟體介面展示

<img src="./img-preview-1.png"/>

<img src="./img-preview-2.png"/>

### ✨ 核心特色

- **🎯 簡潔設計** - 極簡介面，專注於內容本身
- **📝 靈活記錄** - 支援多行文字，記錄待辦事項與日記
- **🎨 心情貼紙** - 豐富的表情符號，記錄每日心情
- **📊 月度視圖** - 清晰的月曆佈局，一覽全月安排
- **☁️ 雲端同步** - 支援 WebDAV 雲同步，多設備數據同步
- **🔐 隱私保護** - 支援 PIN 碼和 TOTP 驗證保護
- **💾 本地儲存** - 數據完全本地化，保護隱私安全
- **🌍 多語言支援** - 支援簡中、繁中、英語、日語、韓語、俄語

## ⭐️ Stars 

[![Star History Chart](https://api.star-history.com/svg?repos=trustdev-org/calendar-diary&type=date&legend=top-left)](https://www.star-history.com/#trustdev-org/calendar-diary&type=date&legend=top-left)

## 🛠️ 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| **React** | 19.2.0 | UI 框架 |
| **TypeScript** | 5.8.2 | 類型安全 |
| **Electron** | 39.2.3 | 桌面應用框架 |
| **Vite** | 6.4.1 | 建構工具 |
| **Tailwind CSS** | 4.1.8 | 樣式框架 |
| **date-fns** | 4.1.0 | 日期處理 |
| **Lucide React** | 0.469.0 | 圖標庫 |
| **webdav** | 5.8.0 | WebDAV 客戶端 |

## 📥 下載安裝

### 最新版本：v0.2.0-beta

前往 [Releases](https://github.com/trustdev-org/calendar-diary/releases) 頁面下載適合你系統的安裝包：

| 平台 | 檔案類型 | 說明 |
|------|----------|------|
| 🪟 **Windows** | `.exe` (NSIS 安裝器) | 支援自訂安裝路徑 |
| 🪟 **Windows** | `.exe` (可攜版) | 無需安裝，解壓即用 |
| 🍎 **macOS** | `.dmg` | 適用於 Apple Silicon (M1/M2/M3) |
| 🐧 **Linux** | `.AppImage` | 通用 Linux 應用格式 |
| 🐧 **Linux** | `.deb` | Debian/Ubuntu 系統 |

### 安裝說明

#### Windows
1. 下載 `CalendarDiary-Setup-0.2.0-beta.exe`
2. 雙擊執行安裝程式
3. 按照嚮導完成安裝

#### macOS
1. 下載 `CalendarDiary-0.2.0-beta-arm64.dmg`
2. 打開 DMG 檔案
3. 將應用拖入 Applications 資料夾
4. 首次執行可能需要在「系統設定 > 隱私與安全性」中允許

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

#### 1️⃣ 查看日曆
- 啟動應用後，預設顯示當月日曆
- 點擊左右箭頭切換月份
- 點擊日期數字快速跳轉到指定日期

#### 2️⃣ 記錄日記/待辦
1. 點擊任意日期格子
2. 在彈出的編輯器中輸入內容
3. 每條記錄可以：
   - 📝 輸入多行文字
   - 😊 選擇表情符號標記
   - 🗑️ 點擊刪除圖標移除
4. 點擊「儲存變更」完成記錄

#### 3️⃣ 添加心情貼紙
- 在日期編輯器底部選擇心情貼紙
- 支援多個貼紙同時添加
- 再次點擊可取消選擇

#### 4️⃣ 月度計畫
- 在日曆頂部區域記錄本月目標
- 支援 3 條獨立的計畫條目
- 計畫會自動儲存

### 進階功能

#### 📦 數據備份與復原

**匯出備份：**
1. 點擊右上角設定圖標 ⚙️
2. 選擇「匯出備份」
3. 選擇儲存位置，檔名格式：`paperplan_backup_YYYY-MM-DD.json`

**匯入備份：**
1. 點擊右上角設定圖標 ⚙️
2. 選擇「匯入備份」
3. 選擇之前匯出的 JSON 檔案
4. 確認匯入後數據將復原

#### 🌍 切換語言
1. 點擊設定圖標 ⚙️
2. 在「語言」下拉選單中選擇
3. 語言會立即切換，無需重啟

#### 📂 查看數據位置
1. 點擊設定圖標 ⚙️
2. 在「數據位置」區域點擊「開啟資料夾」
3. 系統會開啟數據儲存目錄

**數據儲存路徑：**
- Windows: `%APPDATA%\CalendarDiary\`
- macOS: `~/Library/Application Support/CalendarDiary/`
- Linux: `~/.config/CalendarDiary/`

#### 🔄 軟體更新
- 點擊工具列「檢查更新」按鈕
- 如有新版本，會顯示版本資訊和發布頁連結
- 點擊連結前往下載頁下載最新版本

#### ☁️ 雲同步設定
1. 點擊設定圖標 ⚙️
2. 選擇「雲同步」標籤頁
3. 配置 WebDAV 伺服器地址、路徑、使用者名稱和密碼
4. 點擊「測試連線」驗證配置
5. 點擊工具列雲圖標開啟同步管理介面

## 🚀 開發指南

### 環境要求

- **Node.js**: 18.x 或更高版本
- **npm**: Node.js 自帶的套件管理器
- **作業系統**: Windows 10+, macOS 10.13+, Linux

### 複製專案

```bash
git clone https://github.com/trustdev-org/calendar-diary.git
cd calendar-diary
```

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

這將：
1. 啟動 Vite 開發伺服器（埠 5173）
2. 自動啟動 Electron 應用
3. 支援熱重載（HMR）

### 建構打包

#### 建構所有平台

```bash
npm run electron:build
```

#### 建構特定平台

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux
```

建構產物輸出到 `release/` 目錄。

### 技術架構

#### Electron 架構
- **主程序** (`electron/main.ts`): 管理應用視窗、檔案系統
- **渲染程序** (React App): 使用者介面和互動邏輯
- **預載腳本** (`electron/preload.ts`): 安全的 IPC 通訊橋接

#### 數據儲存
所有數據儲存在本地檔案系統：
- **calendar-data.json**: 日記和待辦事項數據
- **monthly-plans.json**: 月度計畫數據

儲存位置：
- **Windows**: `%APPDATA%\CalendarDiary\`
- **macOS**: `~/Library/Application Support/CalendarDiary/`
- **Linux**: `~/.config/CalendarDiary/`

## 🤝 貢獻指南

歡迎貢獻程式碼、回報問題或提出建議！

### 提交 Issue
- 使用清晰的標題描述問題
- 提供詳細的復現步驟
- 附上系統資訊和錯誤日誌

### 提交 Pull Request
1. Fork 本倉庫
2. 建立特性分支：`git checkout -b feature/AmazingFeature`
3. 提交變更：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 開啟 Pull Request

## 📄 授權條款

本專案採用 [CC-BY-NC-4.0](LICENSE) 授權條款。

**您可以：**
- ✅ 分享 - 複製和再分發
- ✅ 修改 - 重新混合、轉換和基於此構建

**條件：**
- 📝 署名 - 必須給出適當的署名
- 🚫 非商業性使用 - 不得用於商業目的

## 🙏 致謝

- 圖標庫：[Lucide Icons](https://lucide.dev/)
- UI 框架：[React](https://react.dev/)
- 桌面框架：[Electron](https://www.electronjs.org/)
- 日期處理：[date-fns](https://date-fns.org/)

## 📮 聯繫方式

- **問題回饋**: [GitHub Issues](https://github.com/trustdev-org/calendar-diary/issues)
- **專案首頁**: [GitHub Repository](https://github.com/trustdev-org/calendar-diary)

---

<div align="center">

**如果這個專案對你有幫助，請給個 ⭐ Star！**

Made with ❤️ by TrustDev

</div>
