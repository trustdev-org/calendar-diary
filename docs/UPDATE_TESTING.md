# 自动更新功能测试指南

本文档说明如何测试 CalendarDiary 的自动更新功能。

## ✅ 更新流程说明

### 完整工作流程

1. **应用启动** → 3秒后自动检查更新
2. **检测到新版本** → 右上角弹出更新通知
3. **用户点击"下载更新"** → 开始下载，显示进度条
4. **下载完成** → 显示"立即安装并重启"按钮
5. **用户点击安装** → 应用退出并自动安装新版本
6. **安装完成** → 自动启动新版本

### 技术实现

- **更新检测**: electron-updater 自动从 GitHub Releases 获取 `latest.yml` / `latest-mac.yml`
- **版本比较**: 自动对比本地版本和远程版本
- **下载**: 后台下载新版本安装包
- **安装**: 退出应用后自动运行安装程序

## 🧪 测试准备

### 前置条件

1. ✅ 项目已推送到 GitHub
2. ✅ GitHub Actions 已配置完成
3. ✅ 至少有一个 Release 版本发布

### 测试环境

- 需要使用**打包后的应用**测试（不能在开发模式测试）
- 本地版本号必须**低于** Release 版本号

## 📋 测试步骤

### 方法 1: 正常测试流程

#### 步骤 1: 发布初始版本

```bash
# 1. 设置初始版本为 0.1.0
# 编辑 package.json: "version": "0.1.0"

# 2. 构建并发布
./scripts/release.sh 0.1.0

# 3. 等待 GitHub Actions 构建完成
# 访问: https://github.com/trustdev-org/calendar-diary/actions

# 4. 下载并安装 v0.1.0 版本
# 访问: https://github.com/trustdev-org/calendar-diary/releases/tag/v0.1.0
```

#### 步骤 2: 发布更新版本

```bash
# 1. 更新版本号为 0.1.1
# 编辑 package.json: "version": "0.1.1"

# 2. 发布新版本
./scripts/release.sh 0.1.1

# 3. 等待构建完成
```

#### 步骤 3: 测试自动更新

```bash
# 1. 启动已安装的 v0.1.0 版本
# 2. 等待 3-5 秒
# 3. 应该看到右上角的更新通知
# 4. 点击"下载更新"
# 5. 等待下载完成（查看进度条）
# 6. 点击"立即安装并重启"
# 7. 应用自动关闭并安装
# 8. 新版本自动启动
# 9. 验证版本号（关于页面）
```

### 方法 2: 快速测试（降低本地版本）

如果不想等待构建，可以降低本地版本号：

```bash
# 1. 确保 GitHub 上已有 v0.1.1 的 Release

# 2. 本地降低版本号
# 编辑 package.json: "version": "0.1.0"

# 3. 仅构建本地版本（不发布）
pnpm run electron:build

# 4. 安装构建的 0.1.0 版本
# 打开 release/ 目录，安装生成的安装包

# 5. 启动应用，应该检测到 0.1.1 更新
```

### 方法 3: 测试更新检测（无需安装）

使用开发者工具检查更新逻辑：

```bash
# 1. 启动开发模式
pnpm run electron:dev

# 2. 打开开发者工具（取消注释 main.ts 中的 openDevTools）

# 3. 在控制台手动触发更新检查
window.electronAPI.app.checkForUpdates()

# 4. 查看控制台日志
```

## 🔍 验证清单

### 更新通知显示

- [ ] 应用启动 3 秒后开始检查更新
- [ ] 如有新版本，右上角显示更新通知
- [ ] 通知显示正确的版本号
- [ ] 可以关闭通知（点击 X）

### 下载功能

- [ ] 点击"下载更新"开始下载
- [ ] 显示下载进度条
- [ ] 进度百分比实时更新
- [ ] 下载完成后按钮变为"立即安装并重启"

### 安装功能

- [ ] 点击"立即安装并重启"后应用关闭
- [ ] Windows: 安装程序自动运行
- [ ] macOS: 新版本自动替换旧版本
- [ ] Linux: 自动安装更新
- [ ] 新版本自动启动
- [ ] 版本号已更新

### 错误处理

- [ ] 网络错误时有适当的提示
- [ ] 下载失败可以重试
- [ ] 不会重复弹出更新通知

## 🐛 调试技巧

### 查看更新日志

在主进程中，更新日志会输出到控制台：

```bash
# macOS/Linux - 查看应用日志
# 在终端运行应用查看日志
/Applications/CalendarDiary.app/Contents/MacOS/CalendarDiary

# Windows - 查看应用日志
# 右键应用 → 以管理员身份运行
# 或在命令提示符中运行
"C:\Program Files\CalendarDiary\CalendarDiary.exe"
```

日志示例：
```
[AutoUpdater] Scheduling update check in 3 seconds...
[AutoUpdater] Starting update check...
[AutoUpdater] Checking for updates...
[AutoUpdater] Update available: { version: '0.1.1', ... }
```

### 查看 Release 文件

确保 GitHub Release 包含必要的文件：

**Windows:**
- ✅ `CalendarDiary-Setup-0.1.1.exe`
- ✅ `latest.yml` ← 最重要！

**macOS:**
- ✅ `CalendarDiary-0.1.1-arm64.dmg`
- ✅ `CalendarDiary-0.1.1-arm64.zip`
- ✅ `latest-mac.yml` ← 最重要！

**Linux:**
- ✅ `CalendarDiary-0.1.1-arm64.AppImage`
- ✅ `calendar-diary_0.1.1_amd64.deb`

### 手动检查更新配置

查看 `latest.yml` 内容（从 Release 下载）：

```yaml
version: 0.1.1
files:
  - url: CalendarDiary-Setup-0.1.1.exe
    sha512: [hash]
    size: [size]
path: CalendarDiary-Setup-0.1.1.exe
sha512: [hash]
releaseDate: '2025-01-22T...'
```

### 常见问题排查

#### 1. 不显示更新通知

**可能原因：**
- 本地版本号 ≥ Release 版本号
- `latest.yml` 文件缺失或格式错误
- GitHub Release 未正确发布
- 网络连接问题

**解决方案：**
```bash
# 检查本地版本
cat package.json | grep version

# 检查 Release 版本
# 访问: https://github.com/trustdev-org/calendar-diary/releases

# 手动检查更新（开发者工具）
window.electronAPI.app.checkForUpdates()
  .then(result => console.log('Update check result:', result))
```

#### 2. 下载失败

**可能原因：**
- 网络问题
- GitHub CDN 访问受限
- 文件 URL 错误

**解决方案：**
- 检查网络连接
- 查看控制台错误信息
- 验证 `latest.yml` 中的 URL 是否正确

#### 3. 安装失败

**可能原因：**
- 权限不足
- 应用正在运行
- 安装包损坏

**解决方案：**
- 以管理员权限运行
- 完全关闭应用后再安装
- 重新下载安装包

## 📊 测试报告模板

```markdown
## 更新测试报告

### 测试环境
- 操作系统: macOS 14.0
- 旧版本: v0.1.0
- 新版本: v0.1.1
- 测试日期: 2025-01-22

### 测试结果
- [x] 更新检测正常
- [x] 通知显示正常
- [x] 下载功能正常
- [x] 进度显示正常
- [x] 安装成功
- [x] 版本更新成功

### 发现的问题
无

### 备注
更新过程耗时约 2 分钟，体验良好。
```

## 🎯 最佳实践

1. **版本规划**: 遵循语义化版本，避免频繁发布
2. **测试先行**: 在测试环境充分测试后再发布
3. **逐步发布**: 先发布 beta 版本，稳定后发布正式版
4. **发布说明**: 在 Release Notes 中详细说明更新内容
5. **回滚准备**: 保留旧版本安装包以备回滚

## 🔗 相关资源

- [electron-updater 文档](https://www.electron.build/auto-update)
- [GitHub Releases 文档](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

---

需要帮助？[提交 Issue](https://github.com/trustdev-org/calendar-diary/issues)
