@echo off
setlocal enabledelayedexpansion

REM Function to display the introduction text
:display_intro
cls
echo.
echo   ,---.                  .   .        --.--
echo   `---.,---.,---.,---.   ^|   ^|,---.     ^|  
echo       ^|^|   ^|^|---'^|    ---^|   ^|^|   ^|---  ^|  
echo   `---'^|---'`---'`---'   `---'^|---'     `  
echo        ^|                      ^|            
echo.
echo   Please choose one of the following options:
echo.
echo    [0] Add content
echo    [1] Render specification
echo    [2] Export to PDF
echo    [3] Export to DOCX
echo    [4] Collect external references
echo    [5] Add, remove or view xref source
echo    [6] Configure
echo    [7] Run health check
echo    [8] Open documentation website
echo    [9] Freeze specification
echo    [Q] Quit
echo.
echo    An xref is a reference to another repository.
echo.
goto :eof

REM Function to handle the user's choice
:handle_choice
if "%~1"=="0" goto add_content
if "%~1"=="1" goto render
if "%~1"=="2" goto topdf
if "%~1"=="3" goto todocx
if "%~1"=="4" goto collect_external_references
if "%~1"=="5" goto add_remove_xref_source
if "%~1"=="6" goto configure
if "%~1"=="7" goto health_check
if "%~1"=="8" goto help
if "%~1"=="9" goto freeze
if /i "%~1"=="Q" goto quit
goto invalid_choice

:add_content
cls
echo.
echo.
echo.
echo    ********************
echo.
echo.
echo    You can start adding your content to the markdown files in the "spec" directory.
echo.
echo    You can do this by editing local files in an editor or by going to your repository on GitHub.
echo.
echo    More info: https://trustoverip.github.io/spec-up-t-website/docs/various-roles/content-authors-guide/introduction
echo.
echo.
echo    ********************
goto end_menu

:render
cls
echo.
echo.
echo   ************************************
echo   Render specification
echo   ************************************
echo.
echo.
call npm run render
goto end_menu

:topdf
cls
echo.
echo.
echo   ************************************
echo   Export to PDF
echo   ************************************
echo.
echo.
call npm run topdf
goto end_menu

:todocx
cls
echo.
echo.
echo   ************************************
echo   Export to DOCX
echo   ************************************
echo.
echo.
call npm run todocx
goto end_menu

:collect_external_references
cls
echo.
echo.
echo   ************************************
echo   Collect external references
echo   ************************************
echo.
echo.
call npm run collectExternalReferences
goto end_menu

:add_remove_xref_source
cls
echo.
echo.
echo   ************************************
echo   Add, remove or view xref source
echo   ************************************
echo.
echo.
call npm run addremovexrefsource
goto end_menu

:configure
cls
echo.
echo.
echo   ************************************
echo   Configure
echo   ************************************
echo.
echo.
call npm run configure
goto end_menu

:health_check
cls
echo.
echo.
echo   ************************************
echo   Run health check
echo   ************************************
echo.
echo.
call npm run healthCheck
goto end_menu

:help
cls
echo.
echo.
echo.
echo    You will be redirected to the documentation website
echo.
echo    (https://trustoverip.github.io/spec-up-t-website/).
timeout /t 2 /nobreak >nul
start https://trustoverip.github.io/spec-up-t-website/
goto end_menu

:freeze
cls
echo.
echo.
echo   ************************************
echo   Freeze specification
echo   ************************************
echo.
echo.
call npm run freeze
goto end_menu

:quit
cls
echo.
echo.
echo   ************************************
echo   Goodbye! You chose to exit.
echo   ************************************
echo.
echo.
goto end_menu

:invalid_choice
cls
echo.
echo   Invalid choice. Please try again.
echo.
goto end_menu

:end_menu
echo.
echo.
echo.
echo INFO: Type 'npm run menu' to return to the main menu.
echo.
goto :eof

REM Main script
if "%~1" neq "" (
    call :handle_choice %1
) else (
    call :display_intro
    set /p choice="   Enter your choice: "
    call :handle_choice !choice!
)

endlocal
