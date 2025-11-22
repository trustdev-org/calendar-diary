#!/bin/bash

# CalendarDiary 快速发布脚本
# 用法: ./release.sh [版本号]
# 示例: ./release.sh 0.1.1

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误: 请提供版本号${NC}"
    echo "用法: ./release.sh [版本号]"
    echo "示例: ./release.sh 0.1.1"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}CalendarDiary 发布脚本${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# 1. 检查工作区状态
echo -e "${YELLOW}[1/6] 检查工作区状态...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}错误: 工作区有未提交的更改${NC}"
    git status --short
    exit 1
fi
echo -e "${GREEN}✓ 工作区干净${NC}"
echo ""

# 2. 更新版本号
echo -e "${YELLOW}[2/6] 更新版本号到 $VERSION...${NC}"
# macOS 需要使用 sed -i '' 
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
else
    sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
fi
echo -e "${GREEN}✓ 版本号已更新${NC}"
echo ""

# 3. 提交版本更改
echo -e "${YELLOW}[3/6] 提交版本更改...${NC}"
git add package.json
if git diff --cached --quiet; then
    echo -e "${GREEN}✓ 版本号未变更,跳过提交${NC}"
else
    git commit -m "chore: bump version to $VERSION"
    echo -e "${GREEN}✓ 更改已提交${NC}"
fi
echo ""

# 4. 创建标签
echo -e "${YELLOW}[4/6] 创建标签 $TAG...${NC}"
git tag -a "$TAG" -m "Release $VERSION"
echo -e "${GREEN}✓ 标签已创建${NC}"
echo ""

# 5. 推送到远程
echo -e "${YELLOW}[5/6] 推送到 GitHub...${NC}"
git push origin main
git push origin "$TAG"
echo -e "${GREEN}✓ 已推送到远程${NC}"
echo ""

# 6. 完成
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✓ 发布流程已启动！${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "版本: $VERSION"
echo "标签: $TAG"
echo ""
echo "GitHub Actions 正在自动构建..."
echo "查看进度: https://github.com/trustdev-org/calendar-diary/actions"
echo ""
echo "构建完成后，Release 将自动发布到:"
echo "https://github.com/trustdev-org/calendar-diary/releases/tag/$TAG"
