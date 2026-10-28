# Sao lưu một database Soopi bằng mongodump (định dạng archive nén gzip) + nén thư mục tệp đính kèm.
# Cần MongoDB Database Tools trong tools\mongodb-database-tools (xem database\backup\README.md).
#   .\database\backup\backup.ps1                          # sao lưu soopi_mongodb vào .\backups
#   .\database\backup\backup.ps1 -Database soopi_mongodb_demo
param(
    [string]$Database = "soopi_mongodb",
    [string]$OutDir = (Join-Path $PSScriptRoot "..\..\backups"),
    [string]$Uri = "mongodb://127.0.0.1:27017/?replicaSet=rs0",
    [switch]$SkipFiles
)
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$tools = Join-Path $root "tools\mongodb-database-tools\bin"
if (-not (Test-Path (Join-Path $tools "mongodump.exe"))) { throw "Chưa có mongodump.exe trong $tools — xem database\backup\README.md." }

New-Item -ItemType Directory -Force $OutDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archive = Join-Path (Resolve-Path $OutDir) "$Database-$stamp.archive.gz"

# --archive + --gzip: một tệp duy nhất gồm dữ liệu BSON, index và tùy chọn collection (kể cả validator $jsonSchema).
# mongodump ghi tiến trình ra stderr: không để PowerShell 5.1 coi đó là lỗi, kiểm tra bằng mã thoát.
$ErrorActionPreference = "Continue"
& (Join-Path $tools "mongodump.exe") --uri $Uri --db $Database --archive=$archive --gzip --quiet
$ErrorActionPreference = "Stop"
if ($LASTEXITCODE -ne 0) { throw "mongodump thất bại (mã $LASTEXITCODE)." }
Write-Host "Database: $archive ($([math]::Round((Get-Item $archive).Length / 1KB)) KB)"

# Ảnh/chữ ký nằm trên đĩa, MongoDB chỉ lưu metadata: sao lưu kèm để khôi phục đầy đủ.
$files = Join-Path $root "backend-dotnet\src\Soopi.Api\data\files"
if (-not $SkipFiles -and (Test-Path $files)) {
    $zip = Join-Path (Resolve-Path $OutDir) "$Database-$stamp-files.zip"
    Compress-Archive -Path (Join-Path $files "*") -DestinationPath $zip -Force
    Write-Host "Tệp đính kèm: $zip"
}
