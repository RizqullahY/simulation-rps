@echo off
start "" python -m http.server
timeout /t 2 >nul
start http://127.0.0.1:8000/
