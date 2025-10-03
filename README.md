# Conexión de Adminit a WooCommerce con Apps Script

Este proyecto implementa un sistema en **Google Apps Script** que permite importar y sincronizar productos desde **Adminit** hacia **WooCommerce**, facilitando la gestión de inventario, precios, imágenes y categorías de forma automatizada.

---

## 🚀 Características principales
- Conexión vía **REST API de WooCommerce**.
- Importación de productos desde Adminit mediante hoja de cálculo.
- Soporte para:
  - Código de barras
  - Nombre y descripción del producto
  - Precios normales y en promoción
  - Inventario
  - Categorías y atributos
  - Imágenes (vinculadas por URL, usando PostImage como hosting)
- Validación de datos antes de enviar a WooCommerce.
- Reporte de productos importados exitosamente y de errores.

---

## 🛠️ Tecnologías utilizadas
- **Google Apps Script** (JavaScript para automatización en Google Workspace).
- **WooCommerce REST API**.
- **Google Sheets** como intermediario para los datos de Adminit.
- **PostImage** como hosting de imágenes.

---

## 📂 Estructura del proyecto
- `Codigo.gs` → Script principal con la lógica de conexión e importación.
- `Index.html` → Interfaz para cargar productos y mostrar resultados.
- `README.md` → Documentación del proyecto.

---

## ⚙️ Configuración
1. Crear una hoja de cálculo en Google Sheets con los datos exportados desde Adminit.
2. Vincular el script de Google Apps Script al archivo.
3. Configurar las credenciales de WooCommerce en el script:
   ```javascript
   const API_URL = "https://tu-tienda.com/wp-json/wc/v3/";
   const CONSUMER_KEY = "ck_xxxxxxxxxxxxxxxxxxxxxx";
   const CONSUMER_SECRET = "cs_xxxxxxxxxxxxxxxxxxxxxx";
