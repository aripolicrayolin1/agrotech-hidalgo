# 🚀 Guía para subir AgroTech a GitHub

Sigue estos pasos para subir tu código a un repositorio de GitHub:

## 1. Crear el repositorio en GitHub
1. Ve a [GitHub](https://github.com) e inicia sesión.
2. Haz clic en el botón **"New"** (Nuevo) para crear un repositorio.
3. Ponle un nombre (ej: `agrotech-hidalgo`).
4. Déjalo como **Público** o **Privado** según prefieras.
5. **IMPORTANTE:** No selecciones "Initialize this repository with a README" (ya tenemos uno).
6. Haz clic en **Create repository**.

## 2. Comandos en tu terminal
Abre la terminal en la carpeta de tu proyecto y ejecuta los siguientes comandos:

```bash
# Iniciar git
git init

# Añadir todos los archivos
git add .

# Primer commit
git commit -m "Primer commit: Sistema AgroTech Hidalgo"

# Cambiar a la rama principal
git branch -M main

# Conectar con tu repo (Copia la URL de tu repo de GitHub)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir el código
git push -u origin main
```

## 3. Notas importantes
- El archivo `.gitignore` ya está configurado para no subir la carpeta `node_modules` ni archivos `.env`.
- Si usas Firebase, recuerda que las llaves del cliente son públicas por diseño, pero las reglas de seguridad de Firestore (que ya configuramos) son las que protegen tus datos.

¡Felicidades por tu app! 🌽🛰️