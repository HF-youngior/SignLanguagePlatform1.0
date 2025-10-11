#!/bin/bash

echo "========================================"
echo "手语识别翻译系统启动脚本"
echo "========================================"
echo

echo "正在检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python环境，请先安装Python"
    exit 1
fi

echo "正在检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js环境，请先安装Node.js"
    exit 1
fi

echo
echo "1. 启动后端API服务..."
cd shouyuDetestion/backend_api
gnome-terminal --title="后端API服务" -- bash -c "python3 app.py; exec bash" 2>/dev/null || \
xterm -title "后端API服务" -e "python3 app.py; bash" 2>/dev/null || \
python3 app.py &
echo "后端服务启动中，请等待..."

echo
echo "2. 等待后端服务启动..."
sleep 5

echo
echo "3. 启动前端Vue服务..."
cd ../../vue-frontend
gnome-terminal --title="前端Vue服务" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -title "前端Vue服务" -e "npm run dev; bash" 2>/dev/null || \
npm run dev &
echo "前端服务启动中，请等待..."

echo
echo "========================================"
echo "系统启动完成！"
echo "========================================"
echo
echo "后端API服务: http://localhost:5000"
echo "前端Vue服务: http://localhost:5173"
echo
echo "请等待服务完全启动后，在浏览器中访问:"
echo "http://localhost:5173"
echo
echo "然后点击导航栏中的'翻译'开始使用手语识别功能"
echo
echo "按任意键退出..."
read -n 1
