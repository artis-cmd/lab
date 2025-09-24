@echo off
chcp 65001 >nul
cd /d E:\OneDrive\HTML

if not exist .git (
    echo [ERROR] .git folder not found. Please run git init.
    pause
    exit /b
)

echo Staging changes...
git add .

echo Enter commit message:
set /p msg=Commit message: 
if "%msg%"=="" set msg=auto commit

echo Committing...
git commit -m "%msg%"

echo Pushing to GitHub...
git push origin main

echo Done! Check GitHub repository.
pause,mn.,m,.
