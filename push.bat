@echo off
echo ===================================================
echo 1. Pushing Root FarmAlert Workspace changes...
echo ===================================================
git add package.json
git commit -m "Update root workspaces and admin portal scripts"
git push origin main

echo.
echo ===================================================
echo 2. Pushing Admin Portal changes...
echo ===================================================
cd admin-portal
git push origin main
cd ..

echo.
echo ===================================================
echo Done! All changes have been pushed to GitHub.
echo Netlify will now automatically redeploy both sites.
echo ===================================================
pause
