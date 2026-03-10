@echo off

REM Start all backend services

REM Change to project root directory
cd /d "%~dp0"

echo ⚡ Starting Sign Language Platform Services...
echo ─────────────────────────────────────────

REM Start Python backend (sign language recognition)
echo 🐍 Starting Python Backend (Sign Recognition)...
start "Python Backend" /min powershell -Command "cd shouyuDetestion/backend_api; python app.py"
echo   Address: http://localhost:5000/api

REM Wait 3 seconds
ping 127.0.0.1 -n 3 > nul

REM Start Node.js backend (user, community)
echo 📦 Starting Node.js Backend (User, Community)...
start "Node.js Backend" /min powershell -Command "cd backend; npm start"
echo   Address: http://localhost:8000/api

REM Wait 5 seconds
ping 127.0.0.1 -n 5 > nul

REM Start frontend
echo 🎨 Starting Vue Frontend...
start "Vue Frontend" /min powershell -Command "cd vue-frontend; npm run dev"
echo   Address: http://localhost:3000

echo ─────────────────────────────────────────
echo 🚀 All services started!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000/api
echo 🤖 Sign Recognition API: http://localhost:5000/api
echo ─────────────────────────────────────────
echo Press any key to close this window...
pause > nul
