# 自动更新配置检查清单

在发布第一个版本之前，请确保以下所有项目都已正确配置。

## ✅ 配置检查

### 1. package.json 配置

```json
{
  "name": "calendar-diary",
  "version": "0.1.0",  // ✓ 版本号格式正确
  "build": {
    "appId": "com.calendardiary.app",  // ✓ 应用 ID
    "productName": "CalendarDiary",  // ✓ 产品名称
    "publish": [  // ✓ 发布配置
      {
        "provider": "github",
        "owner": "trustdev-org",  // ✓ 替换为你的 GitHub 用户名/组织
        "repo": "calendar-diary"  // ✓ 替换为你的仓库名
      }
    ]
  }
}
```

- [ ] `version` 字段存在且格式正确（如 `0.1.0`）
- [ ] `build.publish` 配置存在
- [ ] `build.publish.owner` 是你的 GitHub 用户名或组织
- [ ] `build.publish.repo` 是你的仓库名

### 2. electron/main.ts 配置

检查以下代码是否存在：

```typescript
const { autoUpdater } = require('electron-updater');

// 配置
autoUpdater.autoDownload = false;  // ✓ 手动下载
autoUpdater.autoInstallOnAppQuit = true;  // ✓ 退出时安装

// 生产环境检查更新
if (process.env.NODE_ENV !== 'development') {
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 3000);
}
```

- [ ] 已导入 `electron-updater`
- [ ] 配置了 `autoDownload = false`
- [ ] 配置了自动检查更新
- [ ] 添加了所有更新事件监听器

### 3. UpdateNotification 组件

检查 `components/UpdateNotification.tsx`：

- [ ] 组件已创建
- [ ] 监听 `update-available` 事件
- [ ] 监听 `download-progress` 事件
- [ ] 监听 `update-downloaded` 事件
- [ ] 已在 `App.tsx` 中引入

### 4. GitHub Actions 配置

检查 `.github/workflows/build.yml`：

- [ ] 文件存在
- [ ] 配置了三个平台构建（macOS, Windows, Linux）
- [ ] 配置了标签触发 `tags: ['v*']`
- [ ] 配置了自动发布到 Release

### 5. GitHub 仓库设置

在 GitHub 仓库中检查：

- [ ] 仓库已创建
- [ ] 代码已推送
- [ ] Actions 已启用
- [ ] Workflow permissions 设置为 "Read and write permissions"
  - 路径：Settings → Actions → General → Workflow permissions

## 🧪 功能测试

### 测试 1: 版本号验证

```bash
# 查看当前版本
cat package.json | grep '"version"'

# 应该输出：
# "version": "0.1.0",
```

- [ ] 版本号格式正确

### 测试 2: 构建测试

```bash
# 本地构建测试
pnpm run electron:build

# 检查输出
ls -la release/
```

- [ ] 构建成功
- [ ] `release/` 目录包含安装包
- [ ] 包含 `.yml` 配置文件（Windows: `latest.yml`, macOS: `latest-mac.yml`）

### 测试 3: GitHub Actions 测试

```bash
# 创建测试标签
git tag v0.0.1-test
git push origin v0.0.1-test

# 访问 Actions 页面查看
# https://github.com/你的用户名/calendar-diary/actions
```

- [ ] Actions 自动触发
- [ ] 三个平台构建都成功
- [ ] Release 自动创建
- [ ] 所有文件已上传

### 测试 4: 更新文件验证

下载 GitHub Release 中的 `latest.yml` 或 `latest-mac.yml`，检查内容：

```yaml
version: 0.0.1-test
files:
  - url: CalendarDiary-Setup-0.0.1-test.exe  # ✓ 文件名正确
    sha512: [hash]  # ✓ 哈希存在
    size: [size]  # ✓ 大小存在
path: CalendarDiary-Setup-0.0.1-test.exe
sha512: [hash]
releaseDate: '2025-01-22T...'  # ✓ 日期存在
```

- [ ] 文件存在
- [ ] `version` 字段正确
- [ ] `files` 列表不为空
- [ ] 文件 URL 正确
- [ ] 包含 sha512 和 size

## 📝 发布前检查

在发布第一个正式版本前：

- [ ] 所有上述检查项都已通过
- [ ] 已测试过一次完整的发布流程（可以用 test 标签）
- [ ] 已验证 GitHub Release 包含所有必要文件
- [ ] 已本地安装并测试过构建的应用
- [ ] 已更新 CHANGELOG.md
- [ ] 已准备 Release Notes
- [ ] 版本号符合语义化版本规范

## 🎯 首次发布步骤

```bash
# 1. 确认版本号
cat package.json | grep version
# 应该是 "version": "0.1.0"

# 2. 确认所有更改已提交
git status

# 3. 执行发布
./scripts/release.sh 0.1.0

# 4. 等待构建完成（约 10-15 分钟）
# 访问: https://github.com/trustdev-org/calendar-diary/actions

# 5. 验证 Release
# 访问: https://github.com/trustdev-org/calendar-diary/releases/tag/v0.1.0
```

## ❌ 常见错误

### 错误 1: Actions 权限不足

**症状**: Actions 运行失败，提示 "permission denied"

**解决**:
1. Settings → Actions → General
2. Workflow permissions → Read and write permissions
3. 勾选 "Allow GitHub Actions to create and approve pull requests"

### 错误 2: 找不到更新

**症状**: 应用启动后没有检测到更新

**原因**:
- `latest.yml` 文件缺失
- 版本号配置错误
- 网络问题

**解决**:
1. 检查 Release 是否包含 `.yml` 文件
2. 验证版本号格式
3. 查看应用日志

### 错误 3: 下载失败

**症状**: 点击下载更新后失败

**原因**:
- 文件 URL 错误
- GitHub CDN 访问问题

**解决**:
1. 验证 `latest.yml` 中的 URL
2. 尝试手动下载验证
3. 检查网络连接

## 📚 相关文档

- [完整发布指南](./RELEASE.md)
- [更新测试指南](./UPDATE_TESTING.md)
- [electron-updater 文档](https://www.electron.build/auto-update)

---

✅ 所有检查项都通过？恭喜！你可以开始发布了！

需要帮助？[提交 Issue](https://github.com/trustdev-org/calendar-diary/issues)
