@echo off

REM Simple script to start all services

cd /d "%~dp0"

echo Starting Sign Language Platform Services...
echo ================================

REM Start Python backend
start "Python Backend" /min powershell -Command "cd shouyuDetestion/backend_api; python app.py"
echo Python backend started on http://localhost:5000/api

REM Wait
ping 127.0.0.1 -n 3 > nul

REM Start Node.js backend
start "Node.js Backend" /min powershell -Command "cd backend; npm start"
echo Node.js backend started on http://localhost:8000/api

REM Wait
ping 127.0.0.1 -n 5 > nul

REM Start frontend
start "Vue Frontend" /min powershell -Command "cd vue-frontend; npm run dev"
echo Frontend started on http://localhost:3000

echo ================================
echo All services started!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000/api
echo Sign Recognition API: http://localhost:5000/api
echo ================================
echo Press any key to close...
pause > nul
