@echo off
echo Starting KMRL Messaging System...
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
cd Credentials_Server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting the server...
echo Server will be available at: http://localhost:5000
echo Frontend will be available at: file:///d:/collage/SIH25/Frontend/index.html
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start