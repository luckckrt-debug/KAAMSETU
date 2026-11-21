@echo off
title DigiWork - ADB APK Installer
color 0A
echo ======================================================================
echo           DIGIWORK CENTRAL DIRECTORY - ADB 1-CLICK INSTALLER
echo ======================================================================
echo.
echo Checking for connected Android devices via ADB...
adb devices
echo.
echo If your phone is connected with USB Debugging enabled, press any key to install all 3 DigiWork apps.
pause
echo.
echo [1/3] Installing DigiWork Worker (com.digiwork.worker)...
if exist "%~dp0apks\DigiWork-Worker-preview.apk" (
    adb install -r -d "%~dp0apks\DigiWork-Worker-preview.apk"
) else (
    adb install -r -d "%~dp0apks\KaamSetu-Worker-preview.apk"
)
echo.
echo [2/3] Installing DigiWork Hiring (com.digiwork.hiring)...
if exist "%~dp0apks\DigiWork-Hiring-preview.apk" (
    adb install -r -d "%~dp0apks\DigiWork-Hiring-preview.apk"
) else (
    adb install -r -d "%~dp0apks\KaamSetu-Hiring-preview.apk"
)
echo.
echo [3/3] Installing DigiWork Contractor (com.digiwork.contractor)...
if exist "%~dp0apks\DigiWork-Contractor-preview.apk" (
    adb install -r -d "%~dp0apks\DigiWork-Contractor-preview.apk"
) else (
    adb install -r -d "%~dp0apks\KaamSetu-Contractor-preview.apk"
)
echo.
echo ======================================================================
echo INSTALLATION COMPLETE!
echo All 3 DigiWork apps are installed on your connected device.
echo ======================================================================
pause
