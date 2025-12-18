const { interpretQuestion } = require("../services/openAiService.js");
const { executeQuery } = require("../services/queryService.js");

/**
 * Envía y procesa un mensaje para consultas asistidas por IA
 * @async
 * @function sendMessage
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} req.body - Cuerpo de la petición
 * @param {string} req.body.message - Mensaje/consulta del usuario
 * @param {Object} [req.body.dateRange] - Rango de fechas opcional
 * @param {string} [req.body.dateRange.start] - Fecha de inicio (YYYY-MM-DD)
 * @param {string} [req.body.dateRange.end] - Fecha de fin (YYYY-MM-DD)
 * @param {Object} req.user - Usuario autenticado
 * @param {string} req.user.role - Rol del usuario ('mkt', 'hr', etc.)
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Promise<Object>} Respuesta JSON con el resultado procesado
 * @throws {Error} 403 - Acceso no permitido si el rol no es válido
 * @throws {Error} 500 - Error interno del servidor
 * @description 
 * Procesa consultas en lenguaje natural, interpreta la intención mediante IA,
 * y ejecuta consultas a la base de datos. Soporta filtrado por rango de fechas
 * y control de acceso por roles.
 * 
 * @example
 * // POST /api/chat/send
 * // Body (sin dateRange):
 * {
 *   "message": "¿Cuántas ventas hubo este mes?"
 * }
 * // Respuesta con necesidad de fechas:
 * {
 *   "type": "intent",
 *   "data": {
 *     "intent": "sales_report",
 *     "needsDateRange": true,
 *     "parameters": { "metric": "count" }
 *   }
 * }
 * 
 * @example
 * // POST /api/chat/send
 * // Body (con dateRange):
 * {
 *   "message": "Ventas por producto",
 *   "dateRange": {
 *     "start": "2024-01-01",
 *     "end": "2024-01-31"
 *   }
 * }
 * // Respuesta con datos:
 * {
 *   "type": "data",
 *   "data": [...],
 *   "columns": ["producto", "ventas"],
 *   "summary": "Total: 150 ventas"
 * }
 * 
 * @example
 * // Respuesta de error de acceso:
 * {
 *   "type": "text",
 *   "content": "Acceso no permitido"
 * }
 */
const sendMessage = async (req, res) => {
  try {
    const { message, dateRange } = req.body;
    const { role } = req.user;

    // Control de acceso por rol
    if (role !== "mkt" && role !== "hr") {
      return res.status(403).json({
        type: "text",
        content: "Acceso no permitido"
      });
    }

    // Si se proporciona dateRange, ejecutar consulta directamente
    if (dateRange) {
      const response = await executeQuery(message, dateRange);
      return res.json(response);
    }

    // Interpretar la intención de la consulta mediante IA
    const intentData = await interpretQuestion(message);

    // Si no necesita rango de fechas, ejecutar consulta inmediatamente
    if (!intentData.needsDateRange) {
      const response = await executeQuery(intentData);
      return res.json(response);
    }

    // Solicitar rango de fechas al cliente
    return res.json({
      type: "intent",
      data: intentData
    });

  } catch (error) {
    console.error("Error en sendMessage:", error);
    return res.status(500).json({
      type: "text",
      content: "❌ Error procesando la consulta"
    });
  }
};

/**
 * Módulo de controlador para el chat asistido por IA
 * @module controllers/chatController
 * @description Controlador para procesar consultas en lenguaje natural
 * utilizando IA para interpretación y ejecución de consultas a base de datos.
 * Incluye control de acceso por roles y soporte para filtros por fecha.
 */
module.exports = { sendMessage };