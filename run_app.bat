@echo off
echo Starting UrbanGlow Salon System...

:: Start Backend
start "UrbanGlow Backend" cmd /k "cd server && npm install && node index.js"

:: Start Frontend
start "UrbanGlow Frontend" cmd /k "npm install && npm run dev"

echo System starting... Opening Browser...
timeout /t 5
start http://localhost:5173
