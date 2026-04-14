param(
    [string]$OldHost = "rm-2ze90ovu5a037y1ujxo.mysql.rds.aliyuncs.com",
    [string]$OldDb = "signlanguage_platform",
    [string]$NewHost = "rm-2zelg8vzn3xb07mvako.mysql.rds.aliyuncs.com",
    [string]$NewDb = "csl",
    [string]$DbUser = "test1",
    [string]$DbPassword = "asdfgh0625YYH"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

function Ensure-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $Name"
    }
}

function Get-DbSnapshot {
    param(
        [string]$DbHost,
        [string]$Database,
        [string]$User,
        [string]$Password
    )

    $env:SNAP_HOST = $DbHost
    $env:SNAP_DB = $Database
    $env:SNAP_USER = $User
    $env:SNAP_PASSWORD = $Password

    $snapshotJson = @'
const mysql = require("mysql2/promise");

(async () => {
  const host = process.env.SNAP_HOST;
  const database = process.env.SNAP_DB;
  const user = process.env.SNAP_USER;
  const password = process.env.SNAP_PASSWORD;

  const conn = await mysql.createConnection({
    host,
    user,
    password,
    database,
    connectTimeout: 10000,
    charset: "utf8mb4"
  });

  try {
    const [tableRows] = await conn.query("SHOW TABLES");
    const key = `Tables_in_${database}`;
    const tables = tableRows.map((row) => row[key]).sort();

    const counts = {};
    for (const table of tables) {
      const [rows] = await conn.query(`SELECT COUNT(*) AS c FROM \`${table}\``);
      counts[table] = Number(rows[0].c);
    }

    console.log(JSON.stringify({ host, database, tables, counts }, null, 2));
  } finally {
    await conn.end();
  }
})().catch((error) => {
  console.error(JSON.stringify({ error: error.message, code: error.code || null }));
  process.exit(1);
});
'@ | node -

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to read snapshot from $DbHost/$Database.`n$snapshotJson"
    }

    return ($snapshotJson | ConvertFrom-Json)
}

function Invoke-MysqlDumpToFile {
    param(
        [string]$DbHost,
        [string]$Database,
        [string]$User,
        [string]$Password,
        [string]$OutFile
    )

    $stderrFile = "$OutFile.stderr.log"
    if (Test-Path $OutFile) {
        Remove-Item -LiteralPath $OutFile -Force
    }
    if (Test-Path $stderrFile) {
        Remove-Item -LiteralPath $stderrFile -Force
    }

    $args = @(
        "--default-character-set=utf8mb4",
        "--single-transaction",
        "--triggers",
        "--routines",
        "--events",
        "--set-gtid-purged=OFF",
        "-h$DbHost",
        "-u$User",
        $Database
    )

    $proc = Start-Process -FilePath "mysqldump" -ArgumentList $args `
        -RedirectStandardOutput $OutFile `
        -RedirectStandardError $stderrFile `
        -NoNewWindow -Wait -PassThru

    if ($proc.ExitCode -ne 0) {
        $stderr = if (Test-Path $stderrFile) { Get-Content -LiteralPath $stderrFile -Raw } else { "" }
        throw "mysqldump failed for $DbHost/$Database (exit $($proc.ExitCode)).`n$stderr"
    }
}

function Invoke-MysqlQuery {
    param(
        [string]$DbHost,
        [string]$Database,
        [string]$User,
        [string]$Password,
        [string]$Sql
    )

    $output = & mysql "-h$DbHost" "-u$User" "-D" "$Database" "-N" "-s" "-e" "$Sql" 2>&1
    $exitCode = $LASTEXITCODE

    if ($exitCode -ne 0) {
        $message = if ($output) { ($output -join "`n") } else { "" }
        throw "mysql query failed for $DbHost/$Database (exit $exitCode).`nSQL: $Sql`n$message"
    }

    if ($output -is [System.Array]) {
        return ($output -join "`n").Trim()
    }
    return "$output".Trim()
}

function ConvertTo-JsonFile {
    param(
        [Parameter(Mandatory = $true)]$Data,
        [Parameter(Mandatory = $true)][string]$Path
    )
    $Data | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Get-CountValueOrNull {
    param(
        [Parameter(Mandatory = $true)]$Snapshot,
        [Parameter(Mandatory = $true)][string]$Table
    )
    if ($null -eq $Snapshot.counts) {
        return $null
    }
    $prop = $Snapshot.counts.PSObject.Properties[$Table]
    if ($null -ne $prop) {
        return $prop.Value
    }
    return $null
}

Ensure-Command -Name "node"
Ensure-Command -Name "mysql"
Ensure-Command -Name "mysqldump"
$env:MYSQL_PWD = $DbPassword

if ($OldHost -eq $NewHost -and $OldDb -eq $NewDb) {
    throw "Refusing to run: source and target database are identical ($OldHost/$OldDb)."
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path (Join-Path $scriptRoot "..")).Path
$backupDir = Join-Path $repoRoot "backups\db"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$precheckFile = Join-Path $backupDir "precheck_$timestamp.json"
$postcheckFile = Join-Path $backupDir "postcheck_$timestamp.json"
$newBackupFile = Join-Path $backupDir "csl_before_restore_$timestamp.sql"
$oldSourceDumpFile = Join-Path $backupDir "signlanguage_platform_source_$timestamp.sql"
$importStdoutLog = Join-Path $backupDir "import_newdb_$timestamp.out.log"
$importStderrLog = Join-Path $backupDir "import_newdb_$timestamp.err.log"
$verifyReportFile = Join-Path $backupDir "verify_$timestamp.json"

Write-Host "[1/7] Collecting precheck snapshots..."
$oldSnapshotBefore = Get-DbSnapshot -DbHost $OldHost -Database $OldDb -User $DbUser -Password $DbPassword
$newSnapshotBefore = Get-DbSnapshot -DbHost $NewHost -Database $NewDb -User $DbUser -Password $DbPassword

$precheck = [ordered]@{
    generated_at = (Get-Date).ToString("o")
    source = [ordered]@{ host = $OldHost; database = $OldDb }
    target = [ordered]@{ host = $NewHost; database = $NewDb }
    old_snapshot = $oldSnapshotBefore
    new_snapshot = $newSnapshotBefore
    summary = [ordered]@{
        old_table_count = @($oldSnapshotBefore.tables).Count
        new_table_count = @($newSnapshotBefore.tables).Count
        old_counts_selected = [ordered]@{
            users = Get-CountValueOrNull -Snapshot $oldSnapshotBefore -Table "users"
            posts = Get-CountValueOrNull -Snapshot $oldSnapshotBefore -Table "posts"
            comments = Get-CountValueOrNull -Snapshot $oldSnapshotBefore -Table "comments"
            notifications = Get-CountValueOrNull -Snapshot $oldSnapshotBefore -Table "notifications"
            likes = Get-CountValueOrNull -Snapshot $oldSnapshotBefore -Table "likes"
        }
        new_counts_selected = [ordered]@{
            users = Get-CountValueOrNull -Snapshot $newSnapshotBefore -Table "users"
            posts = Get-CountValueOrNull -Snapshot $newSnapshotBefore -Table "posts"
            comments = Get-CountValueOrNull -Snapshot $newSnapshotBefore -Table "comments"
            notifications = Get-CountValueOrNull -Snapshot $newSnapshotBefore -Table "notifications"
            likes = Get-CountValueOrNull -Snapshot $newSnapshotBefore -Table "likes"
        }
    }
}
ConvertTo-JsonFile -Data $precheck -Path $precheckFile
Write-Host "  Precheck saved to: $precheckFile"

Write-Host "[2/7] Backing up current target database ($NewDb)..."
Invoke-MysqlDumpToFile -DbHost $NewHost -Database $NewDb -User $DbUser -Password $DbPassword -OutFile $newBackupFile
Write-Host "  Target backup saved to: $newBackupFile"

Write-Host "[3/7] Exporting source database ($OldDb)..."
Invoke-MysqlDumpToFile -DbHost $OldHost -Database $OldDb -User $DbUser -Password $DbPassword -OutFile $oldSourceDumpFile
Write-Host "  Source dump saved to: $oldSourceDumpFile"

Write-Host "[4/7] Dropping all tables in target database before full import..."
$tableCsv = Invoke-MysqlQuery -DbHost $NewHost -Database $NewDb -User $DbUser -Password $DbPassword `
    -Sql "SELECT GROUP_CONCAT(CONCAT('``', table_name, '``') ORDER BY table_name SEPARATOR ',') FROM information_schema.tables WHERE table_schema = '$NewDb';"

if (-not [string]::IsNullOrWhiteSpace($tableCsv) -and $tableCsv -ne "NULL") {
    $dropSql = "SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS $tableCsv; SET FOREIGN_KEY_CHECKS=1;"
    Invoke-MysqlQuery -DbHost $NewHost -Database $NewDb -User $DbUser -Password $DbPassword -Sql $dropSql | Out-Null
    Write-Host "  Dropped existing target tables."
}
else {
    Write-Host "  Target database already had no tables to drop."
}

Write-Host "[5/7] Importing full source dump into target database..."
if (Test-Path $importStdoutLog) { Remove-Item -LiteralPath $importStdoutLog -Force }
if (Test-Path $importStderrLog) { Remove-Item -LiteralPath $importStderrLog -Force }

$importArgs = @("-h$NewHost", "-u$DbUser", "-D", $NewDb)
$importProc = Start-Process -FilePath "mysql" -ArgumentList $importArgs `
    -RedirectStandardInput $oldSourceDumpFile `
    -RedirectStandardOutput $importStdoutLog `
    -RedirectStandardError $importStderrLog `
    -NoNewWindow -Wait -PassThru

if ($importProc.ExitCode -ne 0) {
    $stderr = if (Test-Path $importStderrLog) { Get-Content -LiteralPath $importStderrLog -Raw } else { "" }
    throw "Import into $NewDb failed (exit $($importProc.ExitCode)).`n$stderr"
}
Write-Host "  Import completed."

Write-Host "[6/7] Running postcheck snapshots and comparison..."
$oldSnapshotAfter = Get-DbSnapshot -DbHost $OldHost -Database $OldDb -User $DbUser -Password $DbPassword
$newSnapshotAfter = Get-DbSnapshot -DbHost $NewHost -Database $NewDb -User $DbUser -Password $DbPassword

$oldTables = @($oldSnapshotAfter.tables)
$newTables = @($newSnapshotAfter.tables)
$missingInNew = @($oldTables | Where-Object { $_ -notin $newTables })
$extraInNew = @($newTables | Where-Object { $_ -notin $oldTables })

$countMismatches = @()
foreach ($table in $oldTables) {
    $newHasTable = $newSnapshotAfter.counts.PSObject.Properties.Name -contains $table
    if (-not $newHasTable) { continue }

    $oldCount = [int64]$oldSnapshotAfter.counts.$table
    $newCount = [int64]$newSnapshotAfter.counts.$table
    if ($oldCount -ne $newCount) {
        $countMismatches += [ordered]@{
            table = $table
            old = $oldCount
            new = $newCount
        }
    }
}

$tableSetMatch = ($missingInNew.Count -eq 0 -and $extraInNew.Count -eq 0)
$countMatch = ($countMismatches.Count -eq 0)
$aligned = ($tableSetMatch -and $countMatch)

$postcheck = [ordered]@{
    generated_at = (Get-Date).ToString("o")
    source = [ordered]@{ host = $OldHost; database = $OldDb }
    target = [ordered]@{ host = $NewHost; database = $NewDb }
    old_snapshot = $oldSnapshotAfter
    new_snapshot = $newSnapshotAfter
    comparison = [ordered]@{
        table_set_match = $tableSetMatch
        count_match = $countMatch
        aligned = $aligned
        missing_in_new = $missingInNew
        extra_in_new = $extraInNew
        count_mismatches = $countMismatches
    }
}
ConvertTo-JsonFile -Data $postcheck -Path $postcheckFile
Write-Host "  Postcheck saved to: $postcheckFile"

Write-Host "[7/7] Running verification script (tables + key users hash)..."
$env:OLD_DB_HOST = $OldHost
$env:OLD_DB_NAME = $OldDb
$env:NEW_DB_HOST = $NewHost
$env:NEW_DB_NAME = $NewDb
$env:DB_USER = $DbUser
$env:DB_PASSWORD = $DbPassword

$verifyScript = Join-Path $scriptRoot "db_verify_sync.js"
$verifyOutput = & node $verifyScript 2>&1
$verifyExitCode = $LASTEXITCODE
($verifyOutput -join "`n") | Set-Content -LiteralPath $verifyReportFile -Encoding UTF8
Write-Host "  Verify report saved to: $verifyReportFile"

if ($verifyExitCode -ne 0) {
    throw "Verification failed. See: $verifyReportFile"
}

if (-not $aligned) {
    throw "Postcheck detected mismatch. See: $postcheckFile"
}

Write-Host ""
Write-Host "Restore completed successfully."
Write-Host "  Precheck: $precheckFile"
Write-Host "  Backup of current target: $newBackupFile"
Write-Host "  Source dump: $oldSourceDumpFile"
Write-Host "  Postcheck: $postcheckFile"
Write-Host "  Verify report: $verifyReportFile"
$env:MYSQL_PWD = $null
