@echo off

REM 停止所有后端服务的统一脚本

REM 进入项目根目录
cd /d "%~dp0"

echo ⚡ 停止手语教学平台所有服务...
echo ─────────────────────────────────────────

REM 停止占用 3000 端口的进程 (前端)
echo 🎨 停止前端服务 (端口3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (  
    taskkill /PID %%a /F > nul 2>&1
    if %errorlevel% equ 0 (
        echo   成功停止前端服务 (PID: %%a)
    )
)

REM 停止占用 8000 端口的进程 (Node.js 后端)
echo 📦 停止 Node.js 后端服务 (端口8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (  
    taskkill /PID %%a /F > nul 2>&1
    if %errorlevel% equ 0 (
        echo   成功停止 Node.js 后端服务 (PID: %%a)
    )
)

REM 停止占用 5000 端口的进程 (Python 后端)
echo 🐍 停止 Python 后端服务 (端口5000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (  
    taskkill /PID %%a /F > nul 2>&1
    if %errorlevel% equ 0 (
        echo   成功停止 Python 后端服务 (PID: %%a)
    )
)

echo ─────────────────────────────────────────
echo ✅ 所有服务已停止！
echo ─────────────────────────────────────────
echo 按任意键关闭此窗口...
pause > nul
