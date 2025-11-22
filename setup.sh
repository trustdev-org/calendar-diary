#!/bin/bash

echo "🚀 开始安装 PaperPlan AI Electron 应用依赖..."

# 安装依赖
npm install

echo ""
echo "✅ 安装完成！"
echo ""
echo "📝 下一步："
echo "   1. 复制 .env.example 为 .env"
echo "      cp .env.example .env"
echo ""
echo "   2. 编辑 .env 文件，添加你的 Gemini API Key"
echo ""
echo "   3. 运行 Electron 应用："
echo "      npm run electron:dev"
echo ""
echo "   或者运行 Web 版本："
echo "      npm run dev"
echo ""
