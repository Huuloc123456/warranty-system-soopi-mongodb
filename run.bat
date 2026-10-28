@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
set "DB=soopi_mongodb"
if /i "%~1"=="initdb" (
  dotnet run --project backend-dotnet\src\Soopi.Api --launch-profile http -- --InitializeOnly=true
  exit /b
)
if /i "%~1"=="test" (
  dotnet test backend-dotnet\Soopi.slnx
  exit /b
)
rem demo-restore: load the bundled 6-month demo snapshot into soopi_mongodb_demo (must be empty).
if /i "%~1"=="demo-restore" (
  set "SOOPI_RESTORE_DB=soopi_mongodb_demo"
  mongosh "mongodb://127.0.0.1:27017/?replicaSet=rs0" --quiet --file database\soopi_mongodb_demo.full.js
  exit /b
)
rem demo-generate: regenerate demo data through the API (see database\demo-data\README.md).
if /i "%~1"=="demo-generate" (
  start "Soopi demo API" dotnet run --project backend-dotnet\src\Soopi.Api --launch-profile http -- --Mongo:Database=soopi_mongodb_demo --Demo:ClockOverride=true
  node database\demo-data\wait-api.mjs
  if errorlevel 1 exit /b 1
  node database\demo-data\generate.mjs
  echo Done. Close the "Soopi demo API" window, then run: run.bat demo
  exit /b
)
if /i "%~1"=="demo" set "DB=soopi_mongodb_demo"
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
echo MongoDB local rs0 - database %DB%
dotnet run --project backend-dotnet\src\Soopi.Api --launch-profile http -- --Mongo:Database=%DB%
