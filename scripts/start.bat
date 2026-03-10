@echo off

cd /d "%~dp0"

echo Starting services...

REM Start Python backend
start powershell -Command "cd shouyuDetestion/backend_api; python app.py"
echo Python backend: http://localhost:5000/api

REM Wait
ping 127.0.0.1 -n 3 > nul

REM Start Node.js backend
start powershell -Command "cd backend; npm start"
echo Node.js backend: http://localhost:8000/api

REM Wait
ping 127.0.0.1 -n 5 > nul

REM Start frontend
start powershell -Command "cd vue-frontend; npm run dev"
echo Frontend: http://localhost:3000

echo All services started!
pause
