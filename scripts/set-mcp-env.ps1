# Sets Windows user environment variables for Cursor MCP servers.
# Run locally in PowerShell — tokens are read securely via prompts (not stored in this file).
# Usage: .\scripts\set-mcp-env.ps1

$vars = @(
    "VERCEL_TOKEN",
    "GITHUB_PERSONAL_ACCESS_TOKEN",
    "SUPABASE_ACCESS_TOKEN",
    "SUPABASE_PROJECT_REF",
    "CONTEXT7_API_KEY"
)

Write-Host "MCP environment setup — enter values (input is hidden for secrets)." -ForegroundColor Cyan
Write-Host "Press Enter to skip a variable and keep its current value.`n"

foreach ($name in $vars) {
    $current = [System.Environment]::GetEnvironmentVariable($name, "User")
    if ($current) {
        Write-Host "${name}: already set (length $($current.Length))"
        $update = Read-Host "  Update? (y/N)"
        if ($update -ne "y" -and $update -ne "Y") { continue }
    }

    if ($name -eq "SUPABASE_PROJECT_REF") {
        $value = Read-Host "  Enter $name (from dashboard URL)"
    } else {
        $secure = Read-Host "  Enter $name" -AsSecureString
        $value = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
        )
    }

    if ($value) {
        [System.Environment]::SetEnvironmentVariable($name, $value, "User")
        Write-Host "  Set $name" -ForegroundColor Green
    }
}

Write-Host "`nDone. Restart Cursor completely for env vars to take effect." -ForegroundColor Yellow
