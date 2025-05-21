# 1. First, remove the temporary scripts used for migration
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\move-files.ps1" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\update-imports.ps1" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\update-paths.ps1" -Force -ErrorAction SilentlyContinue

# 2. Remove the original src directory now that everything is in frontend/src
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\src" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Remove the duplicate config files in the root dir since they're now in frontend/
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\eslint.config.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\index.html" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\package.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\postcss.config.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\tailwind.config.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\tsconfig.app.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\tsconfig.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\tsconfig.node.json" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\vite.config.ts" -Force -ErrorAction SilentlyContinue

# 4. Check for and remove any .bolt directory if it exists
Remove-Item -Path "c:\Users\Syed Afroz\Pictures\project-bolt-sb1-9jbpdxsf\project\.bolt" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Cleanup complete! All unnecessary files have been removed."
