<div align="center">

[简体中文](README.md) | [English](README_EN.md) | [繁體中文](README_TW.md) | **日本語**

# 📅 CalendarDiary - カレンダー日記

<p align="center">
  <img src="logo.png" alt="CalendarDiary Logo" width="120" height="120">
</p>

**毎日の生活を記録するシンプルでエレガントなカレンダー日記アプリ**

[![Version](https://img.shields.io/badge/version-0.2.0--beta-blue.svg)](https://github.com/trustdev-org/calendar-diary/releases)
[![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/trustdev-org/calendar-diary/releases)

[📥 ダウンロード](#-インストール) • [✨ 使い方](#-使い方) • [🚀 開発ガイド](#-開発ガイド) • [📝 変更履歴](CHANGELOG.md)

</div>

---

## 📖 アプリ紹介

CalendarDiary は、モダンなデザイン哲学を採用したクロスプラットフォームのデスクトップカレンダー日記アプリで、シンプルで直感的な記録体験を提供します。

### スクリーンショット

<img src="./img-preview-1.png"/>

<img src="./img-preview-2.png"/>

### ✨ 主な機能

- **🎯 シンプルデザイン** - コンテンツに集中できるミニマルなインターフェース
- **📝 柔軟な記録** - 複数行テキスト対応、ToDoと日記の記録
- **🎨 ムードステッカー** - 豊富な絵文字で毎日の気分を記録
- **📊 月間ビュー** - 月全体を一覧できる明確なカレンダーレイアウト
- **☁️ クラウド同期** - WebDAV クラウド同期対応、複数デバイス間でデータ同期
- **🔐 プライバシー保護** - PIN コードと TOTP 認証による保護
- **💾 ローカルストレージ** - 完全ローカル保存でプライバシーを保護
- **🌍 多言語対応** - 簡体字中国語、繁体字中国語、英語、日本語、韓国語、ロシア語対応

## ⭐️ Stars 

[![Star History Chart](https://api.star-history.com/svg?repos=trustdev-org/calendar-diary&type=date&legend=top-left)](https://www.star-history.com/#trustdev-org/calendar-diary&type=date&legend=top-left)

## 🛠️ 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **React** | 19.2.0 | UI フレームワーク |
| **TypeScript** | 5.8.2 | 型安全性 |
| **Electron** | 39.2.3 | デスクトップフレームワーク |
| **Vite** | 6.4.1 | ビルドツール |
| **Tailwind CSS** | 4.1.8 | スタイリング |
| **date-fns** | 4.1.0 | 日付処理 |
| **Lucide React** | 0.469.0 | アイコンライブラリ |
| **webdav** | 5.8.0 | WebDAV クライアント |

## 📥 インストール

### 最新バージョン：v0.2.0-beta

[Releases](https://github.com/trustdev-org/calendar-diary/releases) ページから、お使いのシステムに適したインストーラーをダウンロードしてください：

| プラットフォーム | ファイル形式 | 説明 |
|-----------------|-------------|------|
| 🪟 **Windows** | `.exe` (NSIS インストーラー) | カスタムインストールパス対応 |
| 🪟 **Windows** | `.exe` (ポータブル版) | インストール不要 |
| 🍎 **macOS** | `.dmg` | Apple Silicon (M1/M2/M3) 対応 |
| 🐧 **Linux** | `.AppImage` | 汎用 Linux 形式 |
| 🐧 **Linux** | `.deb` | Debian/Ubuntu システム |

### インストール手順

#### Windows
1. `CalendarDiary-Setup-0.2.0-beta.exe` をダウンロード
2. ダブルクリックしてインストーラーを実行
3. ウィザードに従ってインストールを完了

#### macOS
1. `CalendarDiary-0.2.0-beta-arm64.dmg` をダウンロード
2. DMG ファイルを開く
3. アプリを Applications フォルダにドラッグ
4. 初回起動時は「システム設定 > プライバシーとセキュリティ」で許可が必要な場合があります

#### Linux
```bash
# AppImage
chmod +x CalendarDiary-0.2.0-beta-arm64.AppImage
./CalendarDiary-0.2.0-beta-arm64.AppImage

# Debian/Ubuntu
sudo dpkg -i calendar-diary_0.2.0-beta_amd64.deb
```

## 📖 使い方

### 基本操作

#### 1️⃣ カレンダーを表示
- アプリ起動時、デフォルトで当月のカレンダーを表示
- 矢印をクリックして月を切り替え
- 日付の数字をクリックして特定の日付にジャンプ

#### 2️⃣ 日記/ToDoを記録
1. 任意の日付セルをクリック
2. ポップアップエディタに内容を入力
3. 各エントリで：
   - 📝 複数行テキストを入力
   - 😊 絵文字マーカーを選択
   - 🗑️ 削除アイコンをクリックして削除
4. 「変更を保存」をクリックして完了

#### 3️⃣ ムードステッカーを追加
- 日付エディタの下部でムードステッカーを選択
- 複数のステッカーを追加可能
- 再度クリックで選択解除

#### 4️⃣ 月間計画
- カレンダー上部で今月の目標を記録
- 3つの独立した計画項目をサポート
- 計画は自動保存

### 詳細機能

#### 📦 データバックアップと復元

**バックアップをエクスポート：**
1. 右上の設定アイコン ⚙️ をクリック
2. 「バックアップをエクスポート」を選択
3. 保存場所を選択、ファイル名形式：`paperplan_backup_YYYY-MM-DD.json`

**バックアップをインポート：**
1. 右上の設定アイコン ⚙️ をクリック
2. 「バックアップをインポート」を選択
3. 以前エクスポートした JSON ファイルを選択
4. 確認後、データが復元されます

#### 🌍 言語を切り替え
1. 設定アイコン ⚙️ をクリック
2. 「言語」ドロップダウンから選択
3. 言語はすぐに切り替わり、再起動不要

#### 📂 データ保存場所を確認
1. 設定アイコン ⚙️ をクリック
2. 「データ保存場所」エリアで「フォルダを開く」をクリック
3. システムがデータストレージディレクトリを開きます

**データ保存パス：**
- Windows: `%APPDATA%\CalendarDiary\`
- macOS: `~/Library/Application Support/CalendarDiary/`
- Linux: `~/.config/CalendarDiary/`

#### 🔄 ソフトウェア更新
- ツールバーの「更新を確認」ボタンをクリック
- 新しいバージョンがある場合、バージョン情報とリリースページへのリンクが表示されます
- リンクをクリックしてダウンロードページへ

#### ☁️ クラウド同期設定
1. 設定アイコン ⚙️ をクリック
2. 「クラウド同期」タブを選択
3. WebDAV サーバーアドレス、パス、ユーザー名、パスワードを設定
4. 「接続テスト」をクリックして確認
5. ツールバーのクラウドアイコンをクリックして同期管理を開く

## 🚀 開発ガイド

### 必要な環境

- **Node.js**: 18.x 以上
- **npm**: Node.js に同梱
- **OS**: Windows 10+, macOS 10.13+, Linux

### プロジェクトをクローン

```bash
git clone https://github.com/trustdev-org/calendar-diary.git
cd calendar-diary
```

### 依存関係をインストール

```bash
npm install
```

### 開発モード

```bash
npm run dev
```

これにより：
1. Vite 開発サーバーが起動（ポート 5173）
2. Electron アプリが自動起動
3. ホットモジュールリプレースメント（HMR）をサポート

### ビルド

#### 全プラットフォーム向けビルド

```bash
npm run electron:build
```

#### 特定プラットフォーム向けビルド

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux
```

ビルド成果物は `release/` ディレクトリに出力されます。

### アーキテクチャ

#### Electron アーキテクチャ
- **メインプロセス** (`electron/main.ts`): アプリウィンドウ、ファイルシステムを管理
- **レンダラープロセス** (React App): ユーザーインターフェースとインタラクションロジック
- **プリロードスクリプト** (`electron/preload.ts`): 安全な IPC 通信ブリッジ

#### データストレージ
すべてのデータはローカルファイルシステムに保存：
- **calendar-data.json**: 日記と ToDo データ
- **monthly-plans.json**: 月間計画データ

保存場所：
- **Windows**: `%APPDATA%\CalendarDiary\`
- **macOS**: `~/Library/Application Support/CalendarDiary/`
- **Linux**: `~/.config/CalendarDiary/`

## 🤝 コントリビュート

コード、Issue、提案は大歓迎です！

### Issue を提出
- 問題を明確に説明するタイトルを使用
- 詳細な再現手順を提供
- システム情報とエラーログを添付

### Pull Request を提出
1. このリポジトリをフォーク
2. フィーチャーブランチを作成：`git checkout -b feature/AmazingFeature`
3. 変更をコミット：`git commit -m 'Add some AmazingFeature'`
4. ブランチにプッシュ：`git push origin feature/AmazingFeature`
5. Pull Request を開く

## 📄 ライセンス

このプロジェクトは [CC-BY-NC-4.0](LICENSE) ライセンスの下で公開されています。

**許可されること：**
- ✅ 共有 - コピーと再配布
- ✅ 改変 - リミックス、変換、構築

**条件：**
- 📝 帰属表示 - 適切なクレジットを表示
- 🚫 非営利 - 商業目的での使用不可

## 🙏 謝辞

- アイコン：[Lucide Icons](https://lucide.dev/)
- UI フレームワーク：[React](https://react.dev/)
- デスクトップフレームワーク：[Electron](https://www.electronjs.org/)
- 日付処理：[date-fns](https://date-fns.org/)

## 📮 お問い合わせ

- **Issue フィードバック**: [GitHub Issues](https://github.com/trustdev-org/calendar-diary/issues)
- **プロジェクトページ**: [GitHub Repository](https://github.com/trustdev-org/calendar-diary)

---

<div align="center">

**このプロジェクトが役に立ったら、⭐ Star をお願いします！**

Made with ❤️ by TrustDev

</div>
