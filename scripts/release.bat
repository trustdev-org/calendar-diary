@echo off
REM CalendarDiary 快速发布脚本 (Windows)
REM 用法: release.bat [版本号]
REM 示例: release.bat 0.1.1

setlocal enabledelayedexpansion

if "%1"=="" (
    echo 错误: 请提供版本号
    echo 用法: release.bat [版本号]
    echo 示例: release.bat 0.1.1
    exit /b 1
)

set VERSION=%1
set TAG=v%VERSION%

echo ================================================
echo CalendarDiary 发布脚本
echo ================================================
echo.

REM 1. 检查工作区状态
echo [1/6] 检查工作区状态...
git status --porcelain > nul 2>&1
if errorlevel 1 (
    echo 错误: 工作区有未提交的更改
    git status --short
    exit /b 1
)
echo √ 工作区干净
echo.

REM 2. 更新版本号
echo [2/6] 更新版本号到 %VERSION%...
powershell -Command "(Get-Content package.json) -replace '\"version\": \".*\"', '\"version\": \"%VERSION%\"' | Set-Content package.json"
echo √ 版本号已更新
echo.

REM 3. 提交版本更改
echo [3/6] 提交版本更改...
git add package.json
git commit -m "chore: bump version to %VERSION%"
echo √ 更改已提交
echo.

REM 4. 创建标签
echo [4/6] 创建标签 %TAG%...
git tag -a "%TAG%" -m "Release %VERSION%"
echo √ 标签已创建
echo.

REM 5. 推送到远程
echo [5/6] 推送到 GitHub...
git push origin main
git push origin "%TAG%"
echo √ 已推送到远程
echo.

REM 6. 完成
echo ================================================
echo √ 发布流程已启动！
echo ================================================
echo.
echo 版本: %VERSION%
echo 标签: %TAG%
echo.
echo GitHub Actions 正在自动构建...
echo 查看进度: https://github.com/trustdev-org/calendar-diary/actions
echo.
echo 构建完成后，Release 将自动发布到:
echo https://github.com/trustdev-org/calendar-diary/releases/tag/%TAG%
