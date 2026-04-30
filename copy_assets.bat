@echo off
echo Copying AI-generated images to your project folder...
mkdir images 2>nul
copy "C:\Users\ankur\.gemini\antigravity\brain\0911ef49-129b-4f40-9f36-61535c413bae\cafe_hero*.png" "images\hero.png"
copy "C:\Users\ankur\.gemini\antigravity\brain\0911ef49-129b-4f40-9f36-61535c413bae\cafe_about*.png" "images\about.png"
copy "C:\Users\ankur\.gemini\antigravity\brain\0911ef49-129b-4f40-9f36-61535c413bae\cafe_menu*.png" "images\menu.png"
echo Images copied successfully! You can now view the website with all AI-generated images.
pause
