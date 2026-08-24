Param(
    [string]$remoteUrl
)

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git is not installed or not in PATH. Install Git for Windows first."
    exit 1
}

if (-not $remoteUrl) {
    Write-Host "Usage: .\push_repo.ps1 -remoteUrl 'https://github.com/yourname/yourrepo.git'"
    exit 1
}

Set-Location -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)/..\

Write-Host "Initializing git repo in $(Get-Location)"
if (-not (Test-Path .git)) { git init }
git add .
git commit -m "Initial QLCT commit" -q
git branch -M main
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin $remoteUrl
Write-Host "Pushing to $remoteUrl ..."
git push -u origin main

Write-Host "Done. Now go to GitHub repo Settings -> Secrets and add APPETIZE_API_TOKEN and optionally signing secrets as README instructs."
