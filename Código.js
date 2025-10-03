/**
 * Importador Adminit → WooCommerce
 * Backend completo con log en tiempo real y creación automática de categorías.
 */

// Configuración de credenciales
const CONFIG = {
  wooUrl: '',
  consumerKey: '',
  consumerSecret: ''
};

var importStatus = {
  current: 0,
  total: 0,
  results: [],
  isRunning: false,
  startTime: null,
  endTime: null,
  categoryMappings: {}
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Importador Adminit → WooCommerce')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function procesarArchivo(base64Data, fileName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tempSheetName = 'TempImport_' + new Date().getTime();
    ss.getSheets().forEach(sheet => {
      if (sheet.getName().startsWith('TempImport_')) ss.deleteSheet(sheet);
    });
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileName);
    const folder = DriveApp.createFolder('Importaciones_Temporales_' + new Date().getTime());
    const file = folder.createFile(blob);
    if (fileName.includes('.xls')) {
      const convertedFile = Drive.Files.insert({
        title: 'Datos_Importados_' + new Date().getTime(),
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [{id: folder.getId()}]
      }, file.getBlob(), {convert: true});
      const tempSS = SpreadsheetApp.openById(convertedFile.id);
      const data = tempSS.getSheets()[0].getDataRange().getValues();
      const newSheet = ss.insertSheet(tempSheetName);
      newSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      folder.setTrashed(true);
      Drive.Files.remove(convertedFile.id);
      return { success: true, rowCount: data.length - 1, headers: data[0], sampleData: data[1], sheetName: tempSheetName };
    } else {
      const csvContent = file.getBlob().getDataAsString();
      const data = Utilities.parseCsv(csvContent);
      const newSheet = ss.insertSheet(tempSheetName);
      newSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
      folder.setTrashed(true);
      return { success: true, rowCount: data.length - 1, headers: data[0], sampleData: data[1], sheetName: tempSheetName };
    }
  } catch (e) {
    return { success: false, message: 'Error: ' + e.message };
  }
}

function probarConexion() {
  const { wooUrl, consumerKey, consumerSecret } = CONFIG;
  const token = Utilities.base64Encode(consumerKey + ':' + consumerSecret);
  const options = { method: 'get', headers: { 'Authorization': 'Basic ' + token }, muteHttpExceptions: true };
  try {
    const response = UrlFetchApp.fetch(wooUrl + 'wp-json/wc/v3', options);
    return response.getResponseCode() === 200 
      ? { success: true, message: '✅ Conexión exitosa' } 
      : { success: false, message: `❌ Error ${response.getResponseCode()}` };
  } catch (e) {
    return { success: false, message: '⚠️ Error: ' + e.message };
  }
}

function getWooCommerceCategories() {
  const { wooUrl, consumerKey, consumerSecret } = CONFIG;
  const endpoint = `${wooUrl}wp-json/wc/v3/products/categories?per_page=100`;
  const token = Utilities.base64Encode(consumerKey + ':' + consumerSecret);
  try {
    const response = UrlFetchApp.fetch(endpoint, {
      headers: { 'Authorization': 'Basic ' + token, 'Content-Type': 'application/json' },
      muteHttpExceptions: true
    });
    if (response.getResponseCode() === 200) {
      return JSON.parse(response.getContentText()).map(cat => ({ id: cat.id, name: cat.name }));
    }
    return [];
  } catch (e) {
    return [];
  }
}

function crearCategoriaSiNoExiste(nombreCategoria, token, wooUrl) {
  let endpoint = wooUrl + 'wp-json/wc/v3/products/categories?per_page=100&search=' + encodeURIComponent(nombreCategoria);
  let response = UrlFetchApp.fetch(endpoint, {
    headers: { 'Authorization': 'Basic ' + token }
  });
  let cats = JSON.parse(response.getContentText());
  let cat = cats.find(c => c.name && c.name.toLowerCase() === nombreCategoria.toLowerCase());
  if (cat) return cat.id;

  // 2. Crear si no existe
  endpoint = wooUrl + 'wp-json/wc/v3/products/categories';
  let resp = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Basic ' + token },
    payload: JSON.stringify({ name: nombreCategoria }),
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() !== 201) {
    throw new Error("No se pudo crear la categoría. Código: " + resp.getResponseCode() + ". Respuesta: " + resp.getContentText());
  }
  let newCat = JSON.parse(resp.getContentText());
  return newCat.id;
}

function importarProductos(mappings, sheetName, categoryMappings) {
  importStatus = {
    current: 0,
    total: 0,
    results: [],
    isRunning: true,
    startTime: new Date(),
    endTime: null,
    categoryMappings: categoryMappings || {}
  };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Hoja no encontrada');
  
  const data = sheet.getDataRange().getValues();
  importStatus.total = data.length - 1;
  
  const { consumerKey, consumerSecret, wooUrl } = CONFIG;
  const token = Utilities.base64Encode(consumerKey + ':' + consumerSecret);
  const endpoint = wooUrl + 'wp-json/wc/v3/products';
  
  const results = [];
  const hojaResultados = crearHojaResultadosTemporal();
  importStatus.results = [];
  
  for (let i = 1; i < data.length; i++) { 
    if (!importStatus.isRunning) break;
    const result = procesarFilaProducto(data[i], data[0], mappings, i, token, endpoint, importStatus.categoryMappings);
    results.push(result);
    importStatus.results.push(result); // Para log en el frontend
    registrarResultado(hojaResultados, result);
    importStatus.current = i;
    Utilities.sleep(300);
  }

  importStatus.isRunning = false;
  importStatus.endTime = new Date();
  
  return {
    summary: {
      total: data.length - 1,
      success: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error').length,
      duration: Math.round((importStatus.endTime - importStatus.startTime) / 1000) + ' segundos',
      resultsSheet: hojaResultados
    },
    products: results
  };
}

function procesarFilaProducto(row, headers, mappings, currentIndex, token, endpoint, categoryMappings) {
  const productData = {};
  const rowDetails = {};
  headers.forEach((header, index) => rowDetails[header] = row[index]);

  Object.entries(mappings).forEach(([wooField, colName]) => {
    if (colName && headers.includes(colName)) {
      productData[wooField] = row[headers.indexOf(colName)];
    }
  });

  let errorMessage = '';
  if (!productData.name) errorMessage += 'Nombre requerido. ';
  if (!productData.regular_price || isNaN(productData.regular_price)) errorMessage += 'Precio inválido. ';
  
  const inventarioIndex = headers.indexOf(mappings.inventario);
  if (inventarioIndex === -1) errorMessage += 'Columna de inventario no encontrada. ';
  
  const cantidad = parseFloat(row[inventarioIndex]) || 0;
  const esServicio = headers.includes('Es un servicio (No contemplar en inventario)') 
    ? row[headers.indexOf('Es un servicio (No contemplar en inventario)')] === 'Sí'
    : false;

  // Obtener la columna de categoría mapeada y su valor
  let categoryFieldName = mappings.Categoria;
  let categoryValue = (categoryFieldName && headers.includes(categoryFieldName)) ? row[headers.indexOf(categoryFieldName)] : '';
  let wooCatId = (categoryMappings && categoryValue && categoryMappings[categoryValue]) ? categoryMappings[categoryValue] : null;

  if (!wooCatId && categoryValue) {
    try {
      const { wooUrl } = CONFIG;
      wooCatId = crearCategoriaSiNoExiste(categoryValue, token, wooUrl);
      if (wooCatId) {
        categoryMappings[categoryValue] = wooCatId;
      }
    } catch (err) {
      errorMessage += `No se pudo crear la categoría "${categoryValue}". `;
    }
  }

  if (errorMessage) {
    return {
      status: 'error',
      message: errorMessage.trim(),
      row: currentIndex + 1,
      productName: productData.name || 'Sin nombre',
      errorType: 'validación',
      rowData: rowDetails,
      woocommerceMessage: '',
      timestamp: new Date().toISOString()
    };
  }

  const payload = {
    name: String(productData.name),
    type: 'simple',
    regular_price: String(productData.regular_price),
    description: productData.description || '',
    sku: productData.sku || '',
    manage_stock: !esServicio,
    stock_quantity: !esServicio ? cantidad : 0,
    stock_status: !esServicio ? (cantidad > 0 ? 'instock' : 'outofstock') : 'instock',
    categories: wooCatId ? [{ id: wooCatId }] : [],
    meta_data: [
      { key: "_imported_from_adminit", value: "true" },
      { key: "_import_timestamp", value: new Date().toISOString() }
    ]
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Basic ' + token },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    let responseText = response.getContentText();
    if (response.getResponseCode() === 201) {
      return {
        status: 'success',
        message: `Inventario: ${cantidad} | ${esServicio ? 'Servicio' : 'Producto'}`,
        row: currentIndex + 1,
        productName: productData.name,
        productId: JSON.parse(responseText).id,
        productData: payload,
        woocommerceMessage: responseText,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        status: 'error',
        message: `Error ${response.getResponseCode()}: ${responseText}`,
        row: currentIndex + 1,
        productName: productData.name,
        errorType: 'woocommerce',
        responseContent: responseText,
        rowData: rowDetails,
        productData: payload,
        woocommerceMessage: responseText,
        timestamp: new Date().toISOString()
      };
    }
  } catch (e) {
    return {
      status: 'error',
      message: `Error de conexión: ${e.message}`,
      row: currentIndex + 1,
      productName: productData.name,
      errorType: 'excepción',
      errorMessage: e.message,
      rowData: rowDetails,
      productData: payload,
      woocommerceMessage: e.message,
      timestamp: new Date().toISOString()
    };
  }
}

function crearHojaResultadosTemporal() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nombreHoja = 'ResultadosImport_' + new Date().getTime();
  ss.getSheets().forEach(sheet => {
    if (sheet.getName().startsWith('ResultadosImport_')) ss.deleteSheet(sheet);
  });
  const hoja = ss.insertSheet(nombreHoja);
  hoja.getRange('A1:H1').setValues([['Fila', 'Estado', 'Nombre', 'SKU', 'Precio', 'ID', 'Mensaje', 'Error']])
     .setFontWeight('bold');
  return nombreHoja;
}

function registrarResultado(hoja, resultado) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(hoja);
  if (!sheet) return;
  const fila = [
    resultado.row,
    resultado.status === 'success' ? '✅' : '❌',
    resultado.productName,
    resultado.productData?.sku || '',
    resultado.productData?.regular_price || '',
    resultado.productId || '',
    resultado.message,
    resultado.errorType || ''
  ];
  sheet.appendRow(fila);
  const rango = sheet.getRange(`A${sheet.getLastRow()}:H${sheet.getLastRow()}`);
  rango.setBackground(resultado.status === 'success' ? '#e6f7ee' : '#fce8e6');
}

function actualizarProgresoCliente() {
  return {
    current: importStatus.current,
    total: importStatus.total,
    isRunning: importStatus.isRunning,
    result: importStatus.results.length > 0 ? importStatus.results[importStatus.results.length - 1] : null
  };
}

function cancelarImportacion() {
  importStatus.isRunning = false;
  return { success: true, message: 'Importación cancelada' };
}
