# Khôi phục một bản sao lưu mongodump vào database MỚI (mặc định không ghi đè database đang có).
#   .\database\backup\restore.ps1 -Archive .\backups\soopi_mongodb-20261028-120000.archive.gz
#   .\database\backup\restore.ps1 -Archive <file> -Target soopi_mongodb_restore
# Muốn thay hẳn database đích (xóa rồi nạp lại), thêm -Drop (cần chắc chắn, không hoàn tác được).
param(
    [Parameter(Mandatory = $true)][string]$Archive,
    [string]$Target,
    [string]$Uri = "mongodb://127.0.0.1:27017/?replicaSet=rs0",
    [switch]$Drop
)
$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$tools = Join-Path $root "tools\mongodb-database-tools\bin"
if (-not (Test-Path (Join-Path $tools "mongorestore.exe"))) { throw "Chưa có mongorestore.exe trong $tools — xem database\backup\README.md." }
if (-not (Test-Path $Archive)) { throw "Không thấy tệp $Archive." }

# Tên database nguồn nằm ở đầu tên tệp: <database>-yyyyMMdd-HHmmss.archive.gz
$source = ([IO.Path]::GetFileName($Archive)) -replace '-\d{8}-\d{6}\.archive\.gz$', ''
if (-not $Target) { $Target = "${source}_restore" }

$existing = & mongosh $Uri --quiet --eval "db.getSiblingDB('$Target').getCollectionNames().length"
if ([int]$existing -gt 0 -and -not $Drop) { throw "Database $Target đã có $existing collection. Chọn -Target khác hoặc thêm -Drop." }

$args = @("--uri", $Uri, "--archive=$Archive", "--gzip", "--quiet", "--nsFrom", "$source.*", "--nsTo", "$Target.*")
if ($Drop) { $args += "--drop" }
$ErrorActionPreference = "Continue"
& (Join-Path $tools "mongorestore.exe") @args
$ErrorActionPreference = "Stop"
if ($LASTEXITCODE -ne 0) { throw "mongorestore thất bại (mã $LASTEXITCODE)." }
Write-Host "Đã khôi phục $source -> $Target. Chạy ứng dụng trên database này: dotnet run ... -- --Mongo:Database=$Target"
