@echo off
echo Checking network configuration...
echo.
echo === Your IP Addresses ===
ipconfig | findstr /i "IPv4"
echo.
echo === Testing localhost server ===
curl -s http://localhost:5000/health
echo.
echo === Network interfaces ===
ipconfig /all | findstr /i "adapter\|IPv4"
pause