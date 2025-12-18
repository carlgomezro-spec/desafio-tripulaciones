const OpenAI = require("openai");
const schemaContext = require("../utils/schemaContext");

/**
 * Cliente configurado de OpenAI para interacciones con la API
 * @type {Object}
 * @private
 */
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Interpreta una pregunta en lenguaje natural y la convierte en una estructura de consulta
 * @async
 * @function interpretQuestion
 * @param {string} question - Pregunta/consulta en lenguaje natural del usuario
 * @returns {Promise<Object>} Objeto con la interpretación estructurada de la consulta
 * @throws {SyntaxError} Error al parsear la respuesta JSON de OpenAI
 * @throws {Error} Error de conexión con la API de OpenAI
 * @description 
 * Utiliza el modelo GPT-4o-mini de OpenAI para interpretar preguntas en lenguaje natural
 * y convertirlas en una estructura JSON que puede ser procesada por el sistema de consultas.
 * Incluye el contexto del esquema de la base de datos para mejorar la precisión.
 * 
 * @example
 * // Entrada: pregunta en lenguaje natural
 * const resultado = await interpretQuestion("¿Cuántas ventas hubo en enero?");
 * 
 * // Salida: estructura interpretada
 * {
 *   "intent": "sales_report",
 *   "needsDateRange": true,
 *   "parameters": {
 *     "metric": "count",
 *     "timeframe": "monthly",
 *     "month": "january"
 *   },
 *   "confidence": 0.92
 * }
 * 
 * @example
 * // Otra posible salida:
 * {
 *   "intent": "product_list",
 *   "needsDateRange": false,
 *   "parameters": {
 *     "category": "electronics",
 *     "sortBy": "price",
 *     "order": "desc"
 *   },
 *   "confidence": 0.87
 * }
 */
const interpretQuestion = async (question) => {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { 
        role: "system", 
        content: schemaContext  // Contexto del esquema de la base de datos
      },
      { 
        role: "user", 
        content: question 
      }
    ],
    temperature: 0  // Temperatura 0 para respuestas deterministas
  });

  // Parsear la respuesta JSON de OpenAI
  return JSON.parse(response.choices[0].message.content);
};

/**
 * Módulo de servicio para interpretación de lenguaje natural usando OpenAI
 * @module services/openAiService
 * @description Servicio que utiliza la API de OpenAI para interpretar
 * consultas en lenguaje natural y convertirlas en estructuras consultables.
 * Integra el contexto del esquema de base de datos para mayor precisión.
 */
module.exports = { interpretQuestion };