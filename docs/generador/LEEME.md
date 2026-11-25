# Generador del documento Word

Estos scripts arman `docs/Documento_Saruino.docx` y los diagramas de `docs/diagramas/`.

1. Diagramas (Python con Pillow):
   ```bash
   py diagramas.py ../diagramas
   ```
2. Portada (lee las imágenes de `C:\Users\apm04\Downloads\saruinopagina`):
   ```bash
   py portada.py
   ```
3. Word (Node con la librería `docx`; la primera vez corre `npm install docx@9` en esta carpeta):
   ```bash
   node construir.js ../diagramas ../Documento_Saruino.docx
   ```
   Esta carpeta tiene su propio `package.json` con `"type": "commonjs"`, porque `construir.js` usa `require` y el `package.json` de la raíz del proyecto dice `"type": "module"`. Sin él, Node marca el error `require is not defined`.

La portada ya está hecha (`portada.jpg`); solo hay que volver a correr el paso 2 si cambian las imágenes.
