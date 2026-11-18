@echo off
title KaamSetu - ADB APK Installer
color 0A
echo ======================================================================
echo           KAAMSETU CENTRAL DIRECTORY - ADB 1-CLICK INSTALLER
echo ======================================================================
echo.
echo Checking for connected Android devices via ADB...
adb devices
echo.
echo If your phone is connected with USB Debugging enabled, press any key to install all 3 apps.
pause
echo.
echo [1/3] Installing KaamSetu Worker (com.kaamsetu.worker)...
adb install -r -d "%~dp0apks\KaamSetu-Worker-preview.apk"
echo.
echo [2/3] Installing KaamSetu Hiring (com.kaamsetu.app)...
adb install -r -d "%~dp0apks\KaamSetu-Hiring-preview.apk"
echo.
echo [3/3] Installing KaamSetu Contractor (com.kaamsetu.contractor)...
adb install -r -d "%~dp0apks\KaamSetu-Contractor-preview.apk"
echo.
echo ======================================================================
echo INSTALLATION COMPLETE!
echo All 3 KaamSetu apps are installed on your connected device.
echo ======================================================================
pause
