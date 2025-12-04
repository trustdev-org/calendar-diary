<div align="center">

[简体中文](README.md) | **English** | [繁體中文](README_TW.md) | [日本語](README_JA.md) | [한국어](README_KO.md) | [Русский](README_RU.md)

# 📅 CalendarDiary

<p align="center">
  <img src="logo.png" alt="CalendarDiary Logo" width="120" height="120">
</p>

**A simple and elegant calendar diary app to record your daily life**

[![Version](https://img.shields.io/badge/version-0.2.0--beta-blue.svg)](https://github.com/trustdev-org/calendar-diary/releases)
[![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/trustdev-org/calendar-diary/releases)

[📥 Download](#-installation) • [✨ Usage](#-usage) • [🚀 Development](#-development-guide) • [📝 Changelog](CHANGELOG.md)

</div>

---

## 📖 Introduction

CalendarDiary is a cross-platform desktop calendar diary application with a modern design philosophy, providing users with a simple and intuitive recording experience.

### Screenshots

<img src="./img-preview-1.png"/>

<img src="./img-preview-2.png"/>

### ✨ Key Features

- **🎯 Clean Design** - Minimalist interface focused on content
- **📝 Flexible Recording** - Multi-line text support for todos and diary entries
- **🎨 Mood Stickers** - Rich emoji collection to record daily moods
- **📊 Monthly View** - Clear monthly calendar layout for overview
- **☁️ Cloud Sync** - WebDAV cloud sync support for multi-device data synchronization
- **🔐 Privacy Protection** - PIN code and TOTP authentication support
- **💾 Local Storage** - Fully local data storage for privacy protection
- **🌍 Multi-language** - Supports Simplified Chinese, Traditional Chinese, English, Japanese, Korean, Russian

## ⭐️ Stars 

[![Star History Chart](https://api.star-history.com/svg?repos=trustdev-org/calendar-diary&type=date&legend=top-left)](https://www.star-history.com/#trustdev-org/calendar-diary&type=date&legend=top-left)

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Framework |
| **TypeScript** | 5.8.2 | Type Safety |
| **Electron** | 39.2.3 | Desktop Framework |
| **Vite** | 6.4.1 | Build Tool |
| **Tailwind CSS** | 4.1.8 | Styling |
| **date-fns** | 4.1.0 | Date Handling |
| **Lucide React** | 0.469.0 | Icon Library |
| **webdav** | 5.8.0 | WebDAV Client |

## 📥 Installation

### Latest Version: v0.2.0-beta

Go to [Releases](https://github.com/trustdev-org/calendar-diary/releases) page to download the installer for your system:

| Platform | File Type | Description |
|----------|-----------|-------------|
| 🪟 **Windows** | `.exe` (NSIS Installer) | Custom installation path supported |
| 🪟 **Windows** | `.exe` (Portable) | No installation needed |
| 🍎 **macOS** | `.dmg` | For Apple Silicon (M1/M2/M3) |
| 🐧 **Linux** | `.AppImage` | Universal Linux format |
| 🐧 **Linux** | `.deb` | Debian/Ubuntu systems |

### Installation Instructions

#### Windows
1. Download `CalendarDiary-Setup-0.2.0-beta.exe`
2. Double-click to run the installer
3. Follow the wizard to complete installation

#### macOS
1. Download `CalendarDiary-0.2.0-beta-arm64.dmg`
2. Open the DMG file
3. Drag the app to Applications folder
4. First launch may require permission in "System Settings > Privacy & Security"

#### Linux
```bash
# AppImage
chmod +x CalendarDiary-0.2.0-beta-arm64.AppImage
./CalendarDiary-0.2.0-beta-arm64.AppImage

# Debian/Ubuntu
sudo dpkg -i calendar-diary_0.2.0-beta_amd64.deb
```

## 📖 Usage

### Basic Operations

#### 1️⃣ View Calendar
- App shows current month calendar by default
- Click arrows to switch months
- Click date number to quickly jump to specific date

#### 2️⃣ Record Diary/Todos
1. Click any date cell
2. Enter content in the editor popup
3. Each entry can:
   - 📝 Input multi-line text
   - 😊 Select emoji marker
   - 🗑️ Click delete icon to remove
4. Click "Save Changes" to complete

#### 3️⃣ Add Mood Stickers
- Select mood stickers at the bottom of date editor
- Multiple stickers can be added
- Click again to deselect

#### 4️⃣ Monthly Plan
- Record monthly goals at the top of calendar
- Supports 3 independent plan entries
- Plans are auto-saved

### Advanced Features

#### 📦 Data Backup & Restore

**Export Backup:**
1. Click settings icon ⚙️ in top right
2. Select "Export Backup"
3. Choose save location, filename format: `paperplan_backup_YYYY-MM-DD.json`

**Import Backup:**
1. Click settings icon ⚙️ in top right
2. Select "Import Backup"
3. Select previously exported JSON file
4. Data will be restored after confirmation

#### 🌍 Switch Language
1. Click settings icon ⚙️
2. Select from "Language" dropdown
3. Language switches immediately, no restart needed

#### 📂 View Data Location
1. Click settings icon ⚙️
2. Click "Open Folder" in "Data Location" area
3. System will open data storage directory

**Data Storage Paths:**
- Windows: `%APPDATA%\CalendarDiary\`
- macOS: `~/Library/Application Support/CalendarDiary/`
- Linux: `~/.config/CalendarDiary/`

#### 🔄 Software Update
- Click "Check for Updates" button in toolbar
- If new version available, version info and release page link will be shown
- Click link to go to download page

#### ☁️ Cloud Sync Settings
1. Click settings icon ⚙️
2. Select "Cloud Sync" tab
3. Configure WebDAV server URL, path, username and password
4. Click "Test Connection" to verify
5. Click cloud icon in toolbar to open sync management

## 🚀 Development Guide

### Requirements

- **Node.js**: 18.x or higher
- **npm**: Bundled with Node.js
- **OS**: Windows 10+, macOS 10.13+, Linux

### Clone Project

```bash
git clone https://github.com/trustdev-org/calendar-diary.git
cd calendar-diary
```

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

This will:
1. Start Vite dev server (port 5173)
2. Auto-launch Electron app
3. Support Hot Module Replacement (HMR)

### Build

#### Build for All Platforms

```bash
npm run electron:build
```

#### Build for Specific Platform

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux
```

Build output goes to `release/` directory.

### Architecture

#### Electron Architecture
- **Main Process** (`electron/main.ts`): Manages app window, file system
- **Renderer Process** (React App): User interface and interaction logic
- **Preload Script** (`electron/preload.ts`): Secure IPC communication bridge

#### Data Storage
All data is saved in local file system:
- **calendar-data.json**: Diary and todo data
- **monthly-plans.json**: Monthly plan data

Storage locations:
- **Windows**: `%APPDATA%\CalendarDiary\`
- **macOS**: `~/Library/Application Support/CalendarDiary/`
- **Linux**: `~/.config/CalendarDiary/`

## 🤝 Contributing

Contributions, issues, and suggestions are welcome!

### Submit Issue
- Use clear title describing the problem
- Provide detailed reproduction steps
- Include system info and error logs

### Submit Pull Request
1. Fork this repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

This project is licensed under [CC-BY-NC-4.0](LICENSE).

**You may:**
- ✅ Share - Copy and redistribute
- ✅ Adapt - Remix, transform, and build upon

**Conditions:**
- 📝 Attribution - Must give appropriate credit
- 🚫 NonCommercial - Not for commercial purposes

## 🙏 Acknowledgements

- Icons: [Lucide Icons](https://lucide.dev/)
- UI Framework: [React](https://react.dev/)
- Desktop Framework: [Electron](https://www.electronjs.org/)
- Date Handling: [date-fns](https://date-fns.org/)

## 📮 Contact

- **Issue Feedback**: [GitHub Issues](https://github.com/trustdev-org/calendar-diary/issues)
- **Project Homepage**: [GitHub Repository](https://github.com/trustdev-org/calendar-diary)

---

<div align="center">

**If this project helps you, please give it a ⭐ Star!**

Made with ❤️ by TrustDev

</div>
