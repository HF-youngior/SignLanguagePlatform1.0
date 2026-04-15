@echo off

REM 启动所有后端服务的统一脚本

REM 进入项目根目录
cd /d "%~dp0"
cd ..

echo ⚡ 启动手语教学平台所有服务...
echo ─────────────────────────────────────────

REM 启动 Python 后端服务 (手语识别)
echo 🐍 启动 Python 后端服务 (手语识别)...
start "Python Backend" /min powershell -Command "cd shouyuDetestion/backend_api; python app.py"
echo   服务地址: http://localhost:5000/api

REM 等待 3 秒
ping 127.0.0.1 -n 3 > nul

REM 构建前端静态资源
echo 🏗️ 构建前端静态资源...
cd vue-frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
cd ..

REM 等待 5 秒
ping 127.0.0.1 -n 5 > nul

REM 启动统一平台服务
echo 📦 启动统一平台服务...
start "SignLanguage Platform" /min powershell -Command "$env:PORT='3000'; cd backend; npm start"
echo   服务地址: http://localhost:3000

echo ─────────────────────────────────────────
echo 🚀 所有服务启动完成！
echo 🌐 页面: http://localhost:3000/learn
echo 🔧 后端 API: http://localhost:3000/api
echo 🤖 手语识别 API: http://localhost:5000/api
echo ─────────────────────────────────────────
echo 按任意键关闭此窗口...
pause > nul
