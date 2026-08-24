Param(
    [string]$certPath,
    [string]$provPath
)

if (-not $certPath -or -not (Test-Path $certPath)) {
    Write-Error "Certificate .p12 path is required and must exist."
    exit 1
}
if (-not $provPath -or -not (Test-Path $provPath)) {
    Write-Error "Provisioning profile path is required and must exist."
    exit 1
}

$certOut = "$certPath.b64"
$provOut = "$provPath.b64"

[System.IO.File]::WriteAllText($certOut, [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($certPath)))
[System.IO.File]::WriteAllText($provOut, [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($provPath)))

Write-Host "Created base64 files:`n $certOut`n $provOut"
Write-Host "Open these files and copy the entire contents to GitHub Secrets:`n - APPLE_CERT_BASE64`n - MOBILEPROVISION_BASE64"
