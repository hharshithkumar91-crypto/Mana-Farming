# Deploy script for Mana Farming React/Vite app
# -------------------------------------------------
# This script:
# 1️⃣ Removes stray src/App.js (leaves only src/App.jsx)
# 2️⃣ Initializes a git repo, commits all files
# 3️⃣ Adds the remote GitHub repository (replace USER/REPO below)
# 4️⃣ Sets the homepage field in package.json for GitHub Pages
# 5️⃣ Installs dependencies (npm ci)
# 6️⃣ Builds the Vite app (npx vite build) – output goes to `dist/`
# 7️⃣ Publishes `dist/` to the `gh-pages` branch using gh-pages
# -------------------------------------------------

# ---- USER SETTINGS (edit if needed) ----
$GitHubUser = "hharshithkumar91-crypto"
$RepoName   = "Mana-Farming"
$RemoteUrl  = "https://github.com/$GitHubUser/$RepoName.git"
# ---------------------------------------

# Stop on any error
$ErrorActionPreference = "Stop"

Write-Host "=== Deploying Mana Farming to https://$GitHubUser.github.io/$RepoName/ ==="

# 1️⃣ Remove stray src/App.js if it exists (Vite should only see App.jsx)
$appJs = Join-Path -Path $PSScriptRoot -ChildPath "src\App.js"
if (Test-Path $appJs) {
    Remove-Item $appJs -Force
    Write-Host "Removed stray src/App.js"
}

# 2️⃣ Git init (if .git does not exist)
if (-not (Test-Path (Join-Path $PSScriptRoot ".git"))) {
    git init
    Write-Host "Initialized new git repository"
}

# 3️⃣ Add all files and commit (first commit only)
git add .
# Use a generic commit message; if there is already a commit, this will just add new changes
git commit -m "Deploy Mana Farming app" --allow-empty

# 4️⃣ Set remote (replace if it already exists)
if (git remote get-url origin 2>$null) {
    git remote set-url origin $RemoteUrl
    Write-Host "Updated remote origin to $RemoteUrl"
} else {
    git remote add origin $RemoteUrl
    Write-Host "Added remote origin $RemoteUrl"
}

# 5️⃣ Push to GitHub (creates the main branch if needed)
# Use --set-upstream for first push
if (-not (git rev-parse --verify main 2>$null)) {
    git branch -M main
}
git push -u origin HEAD

# 6️⃣ Set homepage in package.json for GitHub Pages
$packageJson = Join-Path $PSScriptRoot "package.json"
if (Test-Path $packageJson) {
    $pkg = Get-Content $packageJson -Raw | ConvertFrom-Json
    $pkg.homepage = "https://$GitHubUser.github.io/$RepoName/"
    $pkg | ConvertTo-Json -Depth 10 | Set-Content $packageJson -Encoding UTF8
    Write-Host "Updated package.json homepage"
}

# 7️⃣ Install exact dependencies (clean install)
npm ci

# 8️⃣ Build the Vite app (output folder is `dist`)
npx vite build

# 9️⃣ Publish to GitHub Pages using gh-pages (install if missing)
if (-not (Get-Command gh-pages -ErrorAction SilentlyContinue)) {
    npm install -g gh-pages
}
# Publish the `dist` folder to the `gh-pages` branch
npx gh-pages -d dist

Write-Host "=== Deployment complete! ==="
Write-Host "Visit: https://$GitHubUser.github.io/$RepoName/"
