@echo off
echo 启动手语教学平台开发环境...
echo.

echo 检查Node.js版本...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js 18+
    pause
    exit /b 1
)

echo 检查Python版本...
python --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Python，请先安装Python 3.9+
    pause
    exit /b 1
)

echo.
echo 安装前端依赖...
cd frontend
if not exist node_modules (
    echo 正在安装前端依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 前端依赖安装失败
        pause
        exit /b 1
    )
)
cd ..

echo.
echo 安装后端依赖...
cd backend
if not exist node_modules (
    echo 正在安装后端依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 后端依赖安装失败
        pause
        exit /b 1
    )
)
cd ..

echo.
echo 安装AI服务依赖...
cd ai-service
if not exist .venv (
    echo 创建Python虚拟环境...
    python -m venv .venv
)
call .venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo 错误: AI服务依赖安装失败
    pause
    exit /b 1
)
deactivate
cd ..

echo.
echo 所有依赖安装完成！
echo.
echo 启动服务...
echo 前端: http://localhost:3000
echo 后端: http://localhost:8000
echo AI服务: http://localhost:8001
echo.

start "前端服务" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak > nul

start "后端服务" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

start "AI服务" cmd /k "cd ai-service && .venv\Scripts\activate && python main.py"

echo 所有服务已启动！
echo 按任意键退出...
pause > nul
