@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
if /i "%~1"=="initdb" (
  dotnet run --project backend-dotnet\src\Soopi.Api --launch-profile http -- --InitializeOnly=true
  exit /b
)
if /i "%~1"=="test" (
  dotnet test backend-dotnet\Soopi.slnx
  exit /b
)
pushd frontend-react
if not exist node_modules (
  call npm.cmd ci --no-audit --no-fund
  if errorlevel 1 (popd & exit /b 1)
)
call npm.cmd run build
if errorlevel 1 (popd & exit /b 1)
popd
echo.
echo Soopi MongoDB: http://localhost:8081
echo MongoDB local rs0 - database soopi_mongodb
dotnet run --project backend-dotnet\src\Soopi.Api --launch-profile http
