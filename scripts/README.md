# 🚀 快速发布指南

## 一键发布新版本

### macOS / Linux

```bash
# 使用发布脚本
./scripts/release.sh 0.1.1
```

### Windows

```batch
# 使用发布脚本
scripts\release.bat 0.1.1
```

### 手动发布

```bash
# 1. 更新版本号（编辑 package.json）

# 2. 提交并推送
git add package.json
git commit -m "chore: bump version to 0.1.1"
git tag v0.1.1
git push origin main
git push origin v0.1.1

# 3. 等待 GitHub Actions 自动构建
```

## 查看构建进度

访问: https://github.com/trustdev-org/calendar-diary/actions

## 查看发布结果

访问: https://github.com/trustdev-org/calendar-diary/releases

---

详细说明请查看 [完整发布文档](../docs/RELEASE.md)
