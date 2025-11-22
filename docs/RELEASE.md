# GitHub 自动构建和发布配置指南

本文档说明如何在 GitHub 上配置自动构建和发布流程。

## 📋 前置要求

1. **GitHub 仓库**: 确保项目已推送到 GitHub
2. **仓库权限**: 需要有推送标签和创建 Release 的权限
3. **GitHub Actions**: 仓库需要启用 Actions（默认启用）

## 🚀 自动发布流程

### 工作流程说明

项目已配置 GitHub Actions 工作流（`.github/workflows/build.yml`），会自动执行以下操作：

1. **触发条件**: 推送以 `v` 开头的标签（如 `v0.1.0`）
2. **并行构建**: 同时在 macOS、Windows、Linux 三个平台上构建
3. **自动发布**: 构建完成后自动创建 GitHub Release 并上传所有安装包

### 构建产物

| 平台 | 产物 |
|------|------|
| macOS | `.dmg`, `.zip`, `latest-mac.yml` |
| Windows | `.exe`, `latest.yml` |
| Linux | `.AppImage`, `.deb` |

## 📝 发布新版本步骤

### 方法一：命令行发布（推荐）

```bash
# 1. 更新版本号
# 编辑 package.json，修改 version 字段
# 例如: "version": "0.1.1"

# 2. 提交更改
git add package.json
git commit -m "chore: bump version to 0.1.1"

# 3. 创建并推送标签
git tag v0.1.1
git push origin main
git push origin v0.1.1

# 4. 自动开始构建
# 访问 GitHub 仓库的 Actions 标签页查看进度
```

### 方法二：GitHub 网页发布

```bash
# 1. 更新并提交版本号
git add package.json
git commit -m "chore: bump version to 0.1.1"
git push origin main

# 2. 在 GitHub 网页上创建 Release
```

然后在 GitHub 上：
1. 进入仓库页面
2. 点击右侧 "Releases"
3. 点击 "Draft a new release"
4. 填写：
   - Tag version: `v0.1.1`（创建新标签）
   - Target: `main`
   - Release title: `v0.1.1`
   - Description: 描述本次更新内容
5. 点击 "Publish release"

### 方法三：手动触发构建

1. 进入仓库的 "Actions" 标签页
2. 选择 "Build and Release" 工作流
3. 点击 "Run workflow"
4. 选择分支，点击 "Run workflow"

> 注意：手动触发不会自动创建 Release，需要手动创建

## 📦 自动更新配置

### electron-updater 工作原理

1. **检测更新**: 应用启动时检查 GitHub Releases
2. **版本比较**: 对比本地版本和最新 Release 版本
3. **下载安装**: 用户确认后下载并安装更新

### 配置要求

`package.json` 中已配置：

```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "trustdev-org",
        "repo": "calendar-diary"
      }
    ]
  }
}
```

### 更新检测文件

每次发布必须包含以下文件（自动生成）：

- **macOS**: `latest-mac.yml`
- **Windows**: `latest.yml`
- **Linux**: 使用 `latest.yml`

这些文件包含版本信息和下载链接，electron-updater 通过读取这些文件来检测更新。

## 🔧 高级配置

### 自定义构建平台

如果只需要构建特定平台，修改 `.github/workflows/build.yml`：

```yaml
strategy:
  matrix:
    # 只构建 macOS 和 Windows
    os: [macos-latest, windows-latest]
```

### 添加构建通知

在工作流末尾添加通知步骤：

```yaml
- name: Notify on success
  if: success()
  run: echo "Build successful!"

- name: Notify on failure
  if: failure()
  run: echo "Build failed!"
```

### 配置代码签名

#### macOS 代码签名

1. 获取 Apple Developer 证书
2. 在 GitHub 仓库设置中添加 Secrets：
   - `APPLE_ID`: Apple ID
   - `APPLE_ID_PASSWORD`: 应用专用密码
   - `APPLE_TEAM_ID`: 团队 ID

3. 修改 `package.json`：

```json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    }
  }
}
```

#### Windows 代码签名

1. 获取代码签名证书（如 DigiCert）
2. 在 GitHub Secrets 中添加：
   - `WIN_CSC_LINK`: Base64 编码的证书
   - `WIN_CSC_KEY_PASSWORD`: 证书密码

3. 修改构建步骤：

```yaml
- name: Build Electron app (Windows)
  if: matrix.os == 'windows-latest'
  run: pnpm run electron:build:win
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
    CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
```

## 🐛 常见问题

### 1. 构建失败：Permission denied

**原因**: GitHub Token 权限不足

**解决方案**:
1. 进入仓库 Settings → Actions → General
2. 在 "Workflow permissions" 中选择 "Read and write permissions"
3. 勾选 "Allow GitHub Actions to create and approve pull requests"

### 2. 自动更新不工作

**检查清单**:
- ✅ Release 已正确发布
- ✅ `latest.yml` / `latest-mac.yml` 文件已上传
- ✅ 安装包文件已上传
- ✅ 本地版本号低于 Release 版本号
- ✅ 网络连接正常

### 3. macOS 构建失败

**常见原因**:
- 缺少 icon.icns 文件
- Node.js 版本不兼容

**解决方案**:
```bash
# 确保 icon 文件存在
ls -la build/icon.icns

# 本地测试构建
pnpm run electron:build:mac
```

### 4. Windows 构建慢

**原因**: Windows 构建包含多个目标

**优化方案**: 只构建需要的目标

```json
{
  "build": {
    "win": {
      "target": ["nsis"]  // 只构建 NSIS 安装器
    }
  }
}
```

## 📊 监控构建

### 查看构建日志

1. 进入仓库 Actions 标签页
2. 点击具体的工作流运行
3. 点击对应的作业（macOS/Windows/Linux）
4. 查看详细日志

### 下载构建产物

如果不想等待自动发布，可以：

1. 进入完成的工作流运行
2. 滚动到底部 "Artifacts" 部分
3. 下载对应平台的构建产物

## 🎯 最佳实践

### 版本号规范

遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- **主版本号 (Major)**: 不兼容的 API 修改
- **次版本号 (Minor)**: 向下兼容的功能性新增
- **修订号 (Patch)**: 向下兼容的问题修正

示例：
- `1.0.0` → `1.0.1`: Bug 修复
- `1.0.0` → `1.1.0`: 新功能
- `1.0.0` → `2.0.0`: 重大更新

### 发布前检查

- [ ] 更新 `CHANGELOG.md`
- [ ] 更新 `package.json` 版本号
- [ ] 本地测试构建成功
- [ ] 测试自动更新功能
- [ ] 准备 Release Notes

### Release Notes 模板

```markdown
## 🎉 v0.1.1 发布

### ✨ 新功能
- 添加了深色模式
- 支持数据加密

### 🐛 Bug 修复
- 修复了日期跳转问题
- 解决了内存泄漏

### 📝 其他改进
- 优化了启动速度
- 更新了依赖包

**完整更新日志**: [v0.1.0...v0.1.1](https://github.com/trustdev-org/calendar-diary/compare/v0.1.0...v0.1.1)
```

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [electron-builder 文档](https://www.electron.build/)
- [electron-updater 文档](https://www.electron.build/auto-update)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

---

需要帮助？[提交 Issue](https://github.com/trustdev-org/calendar-diary/issues)
