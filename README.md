# 🛍️ Sistema Completo Adminit → WooCommerce + Predictor de Ventas

Este proyecto integra un **sistema de importación** desde Adminit hacia WooCommerce con un **predictor de ventas inteligente** para optimizar la gestión de productos y inventario.

## 📁 Estructura del Proyecto

```
Conexion-de-Adminit-a-Woocommerce-con-Appscripts/
│
├── 📋 README.md                          # Esta documentación
│
├── 🔄 Importador/
│   ├── Código.js                        # Script principal de Apps Script
│   └── Index.html                       # Interfaz web para importación
│
└── 🤖 Predictor/
    ├── 📊 BD/                           # Datos y archivos de exportación
    └── 🔧 Codigo/
        └── Analisis_predictivo_closet.ipynb  # Jupyter Notebook con análisis predictivo
```

## 🚀 Características Principales

### 🔄 Módulo de Importación (Importador)
- **Procesamiento automático** del archivo Excel exportado desde Adminit
- **Conexión directa** vía REST API de WooCommerce
- **Campos soportados**:
  - ✅ Código de barras y SKU
  - ✅ Nombre y descripción del producto
  - ✅ Precios normales y promocionales
  - ✅ Gestión de inventario
  - ✅ Categorías y etiquetas
  - ✅ Imágenes (mediante URLs)

### 🤖 Módulo Predictor de Ventas
- **Análisis predictivo** basado en datos históricos
- **Machine Learning** con regresión lineal optimizada
- **Predicciones inteligentes** de:
  - Ventas estimadas por producto
  - Comportamiento de productos en promoción
  - Optimización de precios y descuentos
  - Gestión proactiva de inventario

## 🛠️ Tecnologías Utilizadas

### Importador
- **Google Apps Script** - Automatización de importación
- **WooCommerce REST API** - Conexión con la tienda
- **HTML/CSS/JavaScript** - Interfaz de usuario

### Predictor
- **Python 3** - Análisis predictivo y machine learning
- **Pandas & NumPy** - Procesamiento de datos
- **Scikit-learn** - Modelos de machine learning
- **Matplotlib & Seaborn** - Visualización de datos
- **Jupyter Notebook** - Entorno de análisis

## ⚙️ Configuración e Instalación

### 1. Configuración del Importador

#### Archivo: `Importador/Código.js`
```javascript
// Configurar credenciales de WooCommerce
const API_URL = "https://tu-tienda.com/wp-json/wc/v3/";
const CONSUMER_KEY = "ck_xxxxxxxxxxxxxxxxxxxxxx";
const CONSUMER_SECRET = "cs_xxxxxxxxxxxxxxxxxxxxxx";

// Configuración de mapeo de campos Adminit → WooCommerce
const FIELD_MAPPING = {
  'Código': 'sku',
  'Nombre': 'name',
  'Precio normal': 'regular_price',
  'Precio rebajado': 'sale_price',
  'Inventario': 'stock_quantity',
  'Categoría': 'categories'
};
```

#### Pasos de implementación:
1. **Crear proyecto en Google Apps Script**
2. **Copiar el contenido de `Código.js`** en el editor
3. **Configurar las credenciales** de WooCommerce
4. **Publicar como aplicación web**

### 2. Configuración del Predictor

#### Requisitos del sistema:
```bash
# Instalar dependencias Python
pip install pandas numpy scikit-learn matplotlib seaborn jupyter
```

#### Archivo: `Predictor/Codigo/Analisis_predictivo_closet.ipynb`

**Características del análisis:**
- ✅ Carga y exploración de datos
- ✅ Limpieza y preprocesamiento
- ✅ Ingeniería de características
- ✅ Modelado con regresión lineal
- ✅ Optimización con GridSearchCV
- ✅ Evaluación de métricas
- ✅ Visualización de resultados

## 📊 Uso del Sistema

### 🔄 Usando el Importador

1. **Exportar productos** desde Adminit en formato CSV
2. **Acceder a la interfaz web** del importador
3. **Cargar el archivo CSV** en el sistema
4. **Ejecutar la importación** hacia WooCommerce
5. **Revisar el reporte** de productos importados/errores

### 🤖 Usando el Predictor

1. **Ejecutar Jupyter Notebook**:
   ```bash
   jupyter notebook Analisis_predictivo_closet.ipynb
   ```

2. **Cargar datos históricos** en la carpeta `Predictor/BD/`

3. **Ejecutar celdas** en orden para:
   - Análisis exploratorio de datos
   - Entrenamiento del modelo predictivo
   - Generación de predicciones
   - Visualización de resultados

4. **Realizar predicciones** específicas:
   ```python
   # Ejemplo de predicción individual
   producto = {
       'categoria': 'camisetas',
       'precio_normal': 25.00,
       'precio_rebajado': 19.99,
       'inventario': 50,
       'en_promocion': True
   }
   
   prediccion = modelo.predict([producto])
   print(f"Ventas estimadas: {prediccion[0]:.2f} unidades")
   ```

## 📈 Métricas y Resultados

### Métricas del Modelo Predictivo
- **MAE (Error Absoluto Medio):** ±X unidades
- **RMSE (Error Cuadrático Medio):** ±Y unidades  
- **R² (Precisión del modelo):** Z%

### Características Analizadas
- Distribución de precios y su impacto en ventas
- Correlaciones entre variables clave
- Patrones estacionales de ventas
- Efectividad de promociones y descuentos
- Comportamiento por categorías de producto

## 🔄 Flujo de Trabajo Integrado

1. **Exportación** → Extraer datos de Adminit
2. **Análisis Predictivo** → Ejecutar notebook para insights
3. **Importación** → Cargar productos a WooCommerce
4. **Monitoreo** → Seguir métricas y ajustar estrategias
5. **Optimización** → Usar predicciones para decisiones

## 🚨 Consideraciones Importantes

### Para el Importador
- ✅ El archivo CSV debe mantener la estructura de exportación de Adminit
- ✅ Las URLs de imágenes deben ser accesibles públicamente
- ✅ Verificar conexión API WooCommerce antes de importar
- ✅ Realizar backup antes de grandes importaciones

### Para el Predictor
- ✅ Los datos históricos deben ser consistentes y completos
- ✅ Actualizar el modelo periódicamente con nuevos datos
- ✅ Validar predicciones con resultados reales
- ✅ Considerar factores externos no capturados en los datos

## 📞 Soporte y Solución de Problemas

### Problemas Comunes del Importador
- **Error de autenticación**: Verificar credenciales WooCommerce
- **Límites de API**: Configurar delays entre requests
- **Formato de datos**: Validar estructura del CSV

### Problemas Comunes del Predictor
- **Datos faltantes**: Revisar completitud del dataset
- **Sobreajuste**: Validar con conjunto de prueba
- **Métricas bajas**: Revisar ingeniería de características

## 🎯 Próximas Mejoras

- [ ] Dashboard integrado para visualización
- [ ] API REST para el predictor
- [ ] Automatización de importaciones programadas
- [ ] Análisis de sentimiento en descripciones
- [ ] Sistema de recomendaciones de precios

---

**¿Listo para optimizar tu tienda?** 🚀 Comienza importando tus productos y descubre insights valiosos con nuestro sistema predictivo integrado.

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y comerciales.
