@echo off
REM This wrapper script checks if node_modules exists before attempting to run the menu
REM This ensures users get a helpful error message if they forgot to run npm install

if not exist "node_modules" (
    echo.
    echo WARNING: node_modules directory not found.
    echo    Please run 'npm install' first to install dependencies.
    echo.
    exit /b 1
)

if not exist "node_modules\spec-up-t" (
    echo.
    echo WARNING: spec-up-t package not found in node_modules.
    echo    Please run 'npm install' to install dependencies.
    echo.
    exit /b 1
)

REM Run the actual menu script
call node_modules\spec-up-t\src\install-from-boilerplate\menu.bat %*
