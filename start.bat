@echo off

cd /d "%~dp0"

echo Starting services...
echo.

REM Start Python backend
start "Python Backend" powershell -Command "cd shouyuDetestion/backend_api; python app.py; Read-Host 'Press Enter to exit Python backend'"
echo Python backend: http://localhost:5000/api

REM Wait
ping 127.0.0.1 -n 3 > nul

REM Build frontend bundle
echo Building frontend...
cd vue-frontend
call npm run build
if %errorlevel% neq 0 (
  echo Frontend build failed.
  pause
  exit /b 1
)
cd ..

REM Wait
ping 127.0.0.1 -n 5 > nul

REM Start unified platform service on port 3000
start "SignLanguage Platform" powershell -Command "$env:PORT='3000'; cd backend; npm start; Read-Host 'Press Enter to exit service'"
echo Platform: http://localhost:3000

REM Get local IP address
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4 Address"') do set IP=%%i
set IP=%IP: =%

echo.
echo Mobile access URL:
echo http://%IP%:3000/learn
echo.
echo Please copy the mobile access URL to your phone browser.
echo.
echo All services started!
echo.
echo This window will remain open. Press any key to close...
pause > nul
