# Build Docker image for LaTeX compilation
# Run this script from the project root directory

Write-Host "Building LaTeX Docker image..." -ForegroundColor Cyan

docker build -t latex-editor-custom .

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDocker image 'latex-editor-custom' built successfully!" -ForegroundColor Green
    Write-Host "`nYou can now start the backend server." -ForegroundColor Yellow
} else {
    Write-Host "`nDocker build failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}
