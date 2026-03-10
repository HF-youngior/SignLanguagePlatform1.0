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

REM 启动 Node.js 后端服务 (用户、社区)
echo 📦 启动 Node.js 后端服务 (用户、社区)...
start "Node.js Backend" /min powershell -Command "cd backend; npm start"
echo   服务地址: http://localhost:8000/api

REM 等待 5 秒
ping 127.0.0.1 -n 5 > nul

REM 启动前端服务
echo 🎨 启动 Vue 前端服务...
start "Vue Frontend" /min powershell -Command "cd vue-frontend; npm run dev"
echo   服务地址: http://localhost:3000

echo ─────────────────────────────────────────
echo 🚀 所有服务启动完成！
echo 🌐 前端: http://localhost:3000
echo 🔧 后端 API: http://localhost:8000/api
echo 🤖 手语识别 API: http://localhost:5000/api
echo ─────────────────────────────────────────
echo 按任意键关闭此窗口...
pause > nul
