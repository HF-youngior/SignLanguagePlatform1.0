@echo off
echo ========================================
echo 手语识别翻译系统启动脚本 (本地版本)
echo ========================================
echo.

echo 正在检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Python环境，请先安装Python
    pause
    exit /b 1
)

echo 正在检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Node.js环境，请先安装Node.js
    pause
    exit /b 1
)

echo.
echo 1. 启动后端API服务 (端口5000)...
cd shouyuDetestion\backend_api
start "后端API服务" cmd /k "python app.py"
echo 后端服务启动中，请等待...

echo.
echo 2. 等待后端服务启动...
timeout /t 5 /nobreak >nul

echo.
echo 3. 启动前端Vue服务 (端口3000)...
cd ..\..\vue-frontend
start "前端Vue服务" cmd /k "npm run dev"
echo 前端服务启动中，请等待...

echo.
echo ========================================
echo 系统启动完成！
echo ========================================
echo.
echo 后端API服务: http://localhost:5000
echo 前端Vue服务: http://localhost:3000
echo.
echo 请等待服务完全启动后，在浏览器中访问:
echo http://localhost:3000/translate
echo.
echo 然后开始使用手语识别功能
echo.
echo 按任意键退出...
pause >nul
