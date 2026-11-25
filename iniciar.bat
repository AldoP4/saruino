@echo off
rem Arranque de Saruino para la exposicion (doble clic).
rem 1) Deja la base con los datos de ejemplo  2) abre la pagina  3) prende el servidor.
rem Para apagar el servidor: Ctrl+C en esta ventana.
cd /d "%~dp0"
chcp 65001 >nul

echo.
echo === Saruino: reiniciando la base de datos con los datos de ejemplo ===
py crearBD.py
if errorlevel 1 (
    echo No se pudo ejecutar "py". Revisa que Python este instalado.
    pause
    exit /b 1
)

echo.
echo === Abriendo la pagina en el navegador (en unos segundos) ===
start "" cmd /c "timeout /t 4 >nul & start http://127.0.0.1:5000"

echo.
echo === Servidor prendido. Para apagarlo presiona Ctrl+C ===
py app.py
pause
