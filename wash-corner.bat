@echo off
echo =====================================================
echo          WASH CORNER - APLIKASI KASIR
echo =====================================================
echo.

:: Deteksi administrator
net session >nul 2>&1
if %errorLevel% == 0 (
  echo Running with administrative privileges.
) else (
  echo WARNING: Not running with administrative privileges.
  echo Some operations might fail. Consider running as administrator.
)

:menu
cls
echo WASH CORNER - MENU UTAMA
echo =====================================================
echo.
echo  [1] Setup Database MySQL
echo  [2] Jalankan Aplikasi (Development Mode)
echo  [3] Jalankan Aplikasi (Simpel Mode)
echo  [4] Update Dependencies
echo  [5] Help / Troubleshooting
echo  [0] Keluar
echo.
echo =====================================================
echo.

set /p pilihan=Pilih opsi (0-5): 

if "%pilihan%"=="1" goto setup_database
if "%pilihan%"=="2" goto run_app
if "%pilihan%"=="3" goto run_simple
if "%pilihan%"=="4" goto update_deps
if "%pilihan%"=="5" goto help
if "%pilihan%"=="0" goto end
goto menu

:setup_database
cls
echo =====================================================
echo          SETUP DATABASE MYSQL - XAMPP
echo =====================================================
echo.
echo Pastikan:
echo - MySQL sudah berjalan di XAMPP (aktifkan dari Control Panel)
echo - Anda memiliki akses ke phpMyAdmin
echo.
echo [1] Import database via phpMyAdmin (Recommended)
echo [2] Buat database dari script SQL
echo [B] Kembali ke menu utama
echo.
set /p db_option=Pilih opsi: 

if "%db_option%"=="1" goto import_phpmyadmin
if "%db_option%"=="2" goto import_script
if /i "%db_option%"=="B" goto menu
goto setup_database

:import_phpmyadmin
echo.
echo LANGKAH IMPORT MELALUI PHPMYADMIN:
echo -----------------------------------------------------
echo 1. Buka XAMPP Control Panel dan pastikan MySQL sudah running
echo 2. Klik tombol [Admin] di samping MySQL
echo 3. Di phpMyAdmin:
echo    - Pilih tab "Import"
echo    - Klik "Choose File" dan pilih file "wash_corner.sql"
echo    - Scroll ke bawah dan klik tombol "Go" atau "Import"
echo 4. Tunggu hingga proses selesai
echo.
echo File SQL tersedia di: %cd%\wash_corner.sql
echo.
pause
goto menu

:import_script
echo.
echo Menjalankan script import database via terminal MySQL...
echo -----------------------------------------------------
echo.
set /p mysql_user=Username MySQL [default: root]: 
if "%mysql_user%"=="" set mysql_user=root

set /p mysql_pass=Password MySQL [default kosong, tekan Enter]: 

echo.
echo Mencoba menghubungkan ke MySQL dan mengimpor database...
echo.

if "%mysql_pass%"=="" (
  mysql -u %mysql_user% < wash_corner.sql
) else (
  mysql -u %mysql_user% -p%mysql_pass% < wash_corner.sql
)

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Error: Gagal mengimpor database.
  echo Pastikan MySQL berjalan dan kredensial benar.
  echo.
) else (
  echo.
  echo Database berhasil diimpor!
  echo.
)
pause
goto menu

:run_app
cls
echo =====================================================
echo         MENJALANKAN WASH CORNER (FULL MODE)
echo =====================================================
echo.
echo Pastikan:
echo - MySQL sudah berjalan di XAMPP
echo - Database wash_corner sudah diimpor
echo.

:: Periksa apakah cross-env terinstall
echo Memeriksa dependensi yang diperlukan...
call npm list -g cross-env >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo cross-env tidak ditemukan, menginstall...
  call npm install -g cross-env
)

:: Salin .env-mysql ke .env
echo Menyalin konfigurasi MySQL...
copy .env-mysql .env /Y >nul

:: Menjalankan dengan cross-env berdasarkan versi Node.js
echo Mendeteksi versi Node.js...
FOR /F "tokens=1,2,3 delims=." %%a IN ('node -v') DO (
  set MAJOR=%%a
  set MINOR=%%b
  set PATCH=%%c
)

set MAJOR=%MAJOR:~1%
echo Node.js v%MAJOR%.%MINOR%.%PATCH% terdeteksi.

echo.
echo Menjalankan aplikasi Wash Corner...
echo.
echo Server akan berjalan di http://localhost:5000
echo Tekan Ctrl+C untuk menghentikan server.
echo.

IF %MAJOR% GEQ 22 (
  echo Menggunakan konfigurasi untuk Node.js v%MAJOR%+...
  call npx cross-env NODE_ENV=development USE_MYSQL=true node --import=tsx server/index.ts
) ELSE IF %MAJOR% GEQ 18 (
  echo Menggunakan konfigurasi untuk Node.js v%MAJOR%...
  call npx cross-env NODE_ENV=development USE_MYSQL=true node --loader=tsx server/index.ts
) ELSE (
  echo ⚠️ Versi Node.js %MAJOR%.%MINOR%.%PATCH% mungkin tidak didukung.
  echo Mencoba menjalankan dengan konfigurasi default...
  call npx cross-env NODE_ENV=development USE_MYSQL=true tsx server/index.ts
)

echo.
echo Aplikasi telah berhenti.
pause
goto menu

:run_simple
cls
echo =====================================================
echo         MENJALANKAN WASH CORNER (SIMPLE MODE)
echo =====================================================
echo.

:: Salin .env-mysql ke .env
echo Menyalin konfigurasi MySQL...
copy .env-mysql .env /Y >nul

:: Set variabel lingkungan untuk sesi ini
echo Setting variabel lingkungan...
set NODE_ENV=development
set USE_MYSQL=true

echo.
echo Menjalankan aplikasi Wash Corner (Simple Mode)...
echo.
echo Server akan berjalan di http://localhost:5000
echo Tekan Ctrl+C untuk menghentikan server.
echo.

:: Jalankan aplikasi
call tsx server/index.ts

echo.
echo Aplikasi telah berhenti.
pause
goto menu

:update_deps
cls
echo =====================================================
echo           UPDATE DEPENDENCIES
echo =====================================================
echo.
echo Ini akan mengupdate semua dependencies aplikasi.
echo.
echo [1] Reinstall semua dependencies (npm install)
echo [2] Update cross-env saja
echo [B] Kembali ke menu utama
echo.
set /p update_option=Pilih opsi: 

if "%update_option%"=="1" (
  echo.
  echo Menginstall dependencies (mungkin memakan waktu)...
  call npm install
  echo.
  echo Dependencies updated!
  pause
  goto menu
)

if "%update_option%"=="2" (
  echo.
  echo Menginstall cross-env...
  call npm install -g cross-env
  echo.
  echo cross-env updated!
  pause
  goto menu
)

if /i "%update_option%"=="B" goto menu
goto update_deps

:help
cls
echo =====================================================
echo           HELP & TROUBLESHOOTING
echo =====================================================
echo.
echo MASALAH UMUM:
echo.
echo [1] NODE_ENV tidak dikenali
echo [2] Error koneksi MySQL
echo [3] Error tsx tidak ditemukan
echo [4] Cara downgrade Node.js ke v18
echo [B] Kembali ke menu utama
echo.
set /p help_option=Pilih opsi: 

if "%help_option%"=="1" (
  cls
  echo Masalah: NODE_ENV tidak dikenali
  echo =====================================================
  echo.
  echo Penyebab: Windows tidak mendukung sintaks "NODE_ENV=value command"
  echo.
  echo Solusi:
  echo 1. Gunakan cross-env:
  echo    npx cross-env NODE_ENV=development USE_MYSQL=true tsx server/index.ts
  echo.
  echo 2. Atau set variabel secara terpisah:
  echo    set NODE_ENV=development
  echo    set USE_MYSQL=true
  echo    tsx server/index.ts
  echo.
  pause
  goto help
)

if "%help_option%"=="2" (
  cls
  echo Masalah: Error koneksi MySQL
  echo =====================================================
  echo.
  echo Solusi:
  echo 1. Pastikan MySQL berjalan di XAMPP Control Panel
  echo 2. Periksa file .env berisi:
  echo    USE_MYSQL=true
  echo    MYSQL_HOST=localhost
  echo    MYSQL_PORT=3306
  echo    MYSQL_USER=root
  echo    MYSQL_PASSWORD=
  echo    MYSQL_DATABASE=wash_corner
  echo 3. Pastikan database telah diimpor:
  echo    - Buka phpMyAdmin: http://localhost/phpmyadmin
  echo    - Cek database "wash_corner" ada dan memiliki tabel
  echo.
  pause
  goto help
)

if "%help_option%"=="3" (
  cls
  echo Masalah: Error tsx tidak ditemukan
  echo =====================================================
  echo.
  echo Solusi:
  echo 1. Pastikan tsx terinstall:
  echo    npm install -g tsx
  echo.
  echo 2. Periksa path Node.js sudah benar di PATH environment
  echo.
  echo 3. Coba menjalankan dengan path lengkap:
  echo    npx tsx server/index.ts
  echo.
  pause
  goto help
)

if "%help_option%"=="4" (
  cls
  echo Cara Downgrade Node.js ke v18 LTS
  echo =====================================================
  echo.
  echo Langkah-langkah:
  echo 1. Download Node.js v18 LTS dari:
  echo    https://nodejs.org/download/release/v18.19.1/
  echo.
  echo 2. Uninstall Node.js versi saat ini dari Control Panel
  echo.
  echo 3. Install Node.js v18 yang sudah didownload
  echo.
  echo 4. Verifikasi instalasi dengan:
  echo    node -v
  echo.
  pause
  goto help
)

if /i "%help_option%"=="B" goto menu
goto help

:end
echo.
echo Terima kasih telah menggunakan Wash Corner!
echo.
exit /b 0