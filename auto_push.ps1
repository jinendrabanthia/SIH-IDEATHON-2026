while ($true) {
    git add .
    git commit -m "Auto-commit from script"
    git push origin jinendra
    Start-Sleep -Seconds 30
}
