@echo off
start "" npm run dev
timeout /t 2 >nul
start http://127.0.0.1:3000/
