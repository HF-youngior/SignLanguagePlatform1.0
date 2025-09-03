#!/bin/bash

echo "启动手语教学平台开发环境..."
echo

# 检查Node.js版本
echo "检查Node.js版本..."
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js 18+"
    exit 1
fi
node --version

# 检查Python版本
echo "检查Python版本..."
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python，请先安装Python 3.9+"
    exit 1
fi
python3 --version

echo
echo "安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 前端依赖安装失败"
        exit 1
    fi
fi
cd ..

echo
echo "安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "正在安装后端依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 后端依赖安装失败"
        exit 1
    fi
fi
cd ..

echo
echo "安装AI服务依赖..."
cd ai-service
if [ ! -d ".venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "错误: AI服务依赖安装失败"
    exit 1
fi
deactivate
cd ..

echo
echo "所有依赖安装完成！"
echo
echo "启动服务..."
echo "前端: http://localhost:3000"
echo "后端: http://localhost:8000"
echo "AI服务: http://localhost:8001"
echo

# 启动前端服务
gnome-terminal --title="前端服务" -- bash -c "cd frontend && npm run dev; exec bash" 2>/dev/null || \
xterm -title "前端服务" -e "cd frontend && npm run dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd frontend && npm run dev"' 2>/dev/null || \
echo "请手动启动前端服务: cd frontend && npm run dev"

sleep 3

# 启动后端服务
gnome-terminal --title="后端服务" -- bash -c "cd backend && npm run dev; exec bash" 2>/dev/null || \
xterm -title "后端服务" -e "cd backend && npm run dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd backend && npm run dev"' 2>/dev/null || \
echo "请手动启动后端服务: cd backend && npm run dev"

sleep 3

# 启动AI服务
gnome-terminal --title="AI服务" -- bash -c "cd ai-service && source .venv/bin/activate && python main.py; exec bash" 2>/dev/null || \
xterm -title "AI服务" -e "cd ai-service && source .venv/bin/activate && python main.py; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd ai-service && source .venv/bin/activate && python main.py"' 2>/dev/null || \
echo "请手动启动AI服务: cd ai-service && source .venv/bin/activate && python main.py"

echo "所有服务已启动！"
echo "按Enter键退出..."
read
