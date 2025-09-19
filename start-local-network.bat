@echo off
echo.
echo ========================================
echo    KMRL Local Network Server Launcher
echo ========================================
echo.
echo Starting server for local network access...
echo.

cd Credentials_Server
echo Installing dependencies...
call npm install

echo.
echo Starting server...
echo.
echo IMPORTANT: Share the network URLs shown below with other users!
echo.

call npm start

pause