const pool = require("../config/db");

/**
 * Ejecuta consultas a la base de datos basadas en intenciones interpretadas
 * @async
 * @function executeQuery
 * @param {Object} intentData - Datos de intención interpretados por OpenAI
 * @param {string} intentData.intent - Tipo de consulta a ejecutar
 * @param {Object} [intentData.parameters] - Parámetros adicionales para la consulta
 * @param {Object} [dateRange] - Rango de fechas para consultas temporales
 * @param {string} dateRange.from - Fecha de inicio (YYYY-MM-DD)
 * @param {string} dateRange.to - Fecha de fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Resultado estructurado de la consulta
 * @throws {Error} "dateRange is required for [intent]" - Cuando una consulta necesita rango de fechas
 * @description 
 * Servicio que traduce intenciones interpretadas en consultas SQL reales.
 * Soporta diferentes tipos de respuestas: resúmenes (KPI), tablas y texto.
 * Organizado por categorías de datos: empleados, productos, clientes y ventas.
 * 
 * @example
 * // Consulta de total de empleados (KPI)
 * const result = await executeQuery({ intent: "employee_count" });
 * // Retorna: { type: "summary", content: "...", data: { total: 45 } }
 * 
 * @example
 * // Consulta de ventas con rango de fechas
 * const result = await executeQuery(
 *   { intent: "sales_total" },
 *   { from: "2024-01-01", to: "2024-01-31" }
 * );
 * // Retorna: { type: "summary", content: "...", data: { total: 12500.50 } }
 * 
 * @example
 * // Consulta de listado de productos (tabla)
 * const result = await executeQuery({ intent: "product_list" });
 * // Retorna: { type: "table", content: "...", data: { headers: [...], rows: [...] } }
 */
const executeQuery = async (intentData, dateRange = null) => {
  const { intent } = intentData;

  switch (intent) {

    // =========================
    // 👥 EMPLEADOS (KPI)
    // =========================
    /**
     * Consulta: Total de empleados en el sistema
     * @type {Object}
     * @property {string} type - "summary" (indicador KPI)
     * @property {string} content - Descripción del resultado
     * @property {Object} data - Datos numéricos
     * @property {number} data.total - Número total de empleados
     */
    case "employee_count": {
      const result = await pool.query(
        "SELECT COUNT(*) AS total FROM employees"
      );

      return {
        type: "summary",
        content: "Total de empleados",
        data: { total: Number(result.rows[0].total) }
      };
    }

    // =========================
    // 👥 EMPLEADOS (TABLA)
    // =========================
    /**
     * Consulta: Listado de empleados con información básica
     * @type {Object}
     * @property {string} type - "table" (tabla de datos)
     * @property {string} content - Título de la tabla
     * @property {Object} data - Estructura tabular
     * @property {string[]} data.headers - Encabezados: ["ID", "Nombre", "Apellido", "Departamento"]
     * @property {Array[]} data.rows - Filas con datos de empleados
     * @property {number} data.rows[][0] - ID del empleado
     * @property {string} data.rows[][1] - Nombre
     * @property {string} data.rows[][2] - Apellido
     * @property {string} data.rows[][3] - Departamento
     */
    case "employee_list": {
      const result = await pool.query(`
        SELECT employee_id, first_name, last_name, department
        FROM employees
        ORDER BY last_name
        LIMIT 20
      `);

      return {
        type: "table",
        content: "Listado de empleados",
        data: {
          headers: ["ID", "Nombre", "Apellido", "Departamento"],
          rows: result.rows.map(e => [
            e.employee_id,
            e.first_name,
            e.last_name,
            e.department
          ])
        }
      };
    }

    // =========================
    // 📦 PRODUCTOS (TABLA)
    // =========================
    /**
     * Consulta: Listado de productos del catálogo
     * @type {Object}
     * @property {string} type - "table" (tabla de datos)
     * @property {string} content - Título de la tabla
     * @property {Object} data - Estructura tabular
     * @property {string[]} data.headers - Encabezados: ["ID", "Producto", "Categoría", "Precio"]
     * @property {Array[]} data.rows - Filas con datos de productos
     * @property {number} data.rows[][0] - ID del producto
     * @property {string} data.rows[][1] - Nombre del producto
     * @property {string} data.rows[][2] - Categoría
     * @property {number} data.rows[][3] - Precio unitario
     */
    case "product_list": {
      const result = await pool.query(`
        SELECT product_id, product_name, category, unit_price
        FROM products
        ORDER BY product_name
        LIMIT 20
      `);

      return {
        type: "table",
        content: "Listado de productos",
        data: {
          headers: ["ID", "Producto", "Categoría", "Precio"],
          rows: result.rows.map(p => [
            p.product_id,
            p.product_name,
            p.category,
            p.unit_price
          ])
        }
      };
    }

    // =========================
    // 👤 CLIENTES (TABLA)
    // =========================
    /**
     * Consulta: Listado de clientes registrados
     * @type {Object}
     * @property {string} type - "table" (tabla de datos)
     * @property {string} content - Título de la tabla
     * @property {Object} data - Estructura tabular
     * @property {string[]} data.headers - Encabezados: ["ID", "Cliente", "Región"]
     * @property {Array[]} data.rows - Filas con datos de clientes
     * @property {number} data.rows[][0] - ID del cliente
     * @property {string} data.rows[][1] - Nombre completo (nombre + apellido)
     * @property {string} data.rows[][2] - Región
     */
    case "customer_list": {
      const result = await pool.query(`
        SELECT 
          customer_id,
          first_name_customer,
          last_name_customer,
          region
        FROM customers
        ORDER BY last_name_customer
        LIMIT 20
      `);

      return {
        type: "table",
        content: "Listado de clientes",
        data: {
          headers: ["ID", "Cliente", "Región"],
          rows: result.rows.map(c => [
            c.customer_id,
            `${c.first_name_customer} ${c.last_name_customer}`,
            c.region
          ])
        }
      };
    }

    // =========================
    // 💰 VENTAS (KPI)
    // =========================
    /**
     * Consulta: Total de ventas en un período específico
     * @type {Object}
     * @property {string} type - "summary" (indicador KPI)
     * @property {string} content - Descripción del resultado
     * @property {Object} data - Datos numéricos
     * @property {number} data.total - Suma total de ventas
     * @requires dateRange - Rango de fechas requerido
     */
    case "sales_total": {
      if (!dateRange) {
        throw new Error("dateRange is required for sales_total");
      }

      const result = await pool.query(
        `
        SELECT COALESCE(SUM(total), 0) AS total
        FROM sales
        WHERE sale_timestamp BETWEEN $1 AND $2
        `,
        [dateRange.from, dateRange.to]
      );

      return {
        type: "summary",
        content: "Total de ventas",
        data: { total: Number(result.rows[0].total) }
      };
    }

    // =========================
    // 💰 VENTAS (TABLA)
    // =========================
    /**
     * Consulta: Listado detallado de ventas en un período
     * @type {Object}
     * @property {string} type - "table" (tabla de datos)
     * @property {string} content - Título de la tabla
     * @property {Object} data - Estructura tabular
     * @property {string[]} data.headers - Encabezados: ["ID", "Fecha", "Importe"]
     * @property {Array[]} data.rows - Filas con datos de ventas
     * @property {number} data.rows[][0] - ID de la venta
     * @property {Date} data.rows[][1] - Fecha y hora de la venta
     * @property {number} data.rows[][2] - Importe total
     * @requires dateRange - Rango de fechas requerido
     */
    case "sales_list": {
      if (!dateRange) {
        throw new Error("dateRange is required for sales_list");
      }

      const result = await pool.query(
        `
        SELECT sale_id, sale_timestamp, total
        FROM sales
        WHERE sale_timestamp BETWEEN $1 AND $2
        ORDER BY sale_timestamp DESC
        LIMIT 20
        `,
        [dateRange.from, dateRange.to]
      );

      return {
        type: "table",
        content: "Listado de ventas",
        data: {
          headers: ["ID", "Fecha", "Importe"],
          rows: result.rows.map(s => [
            s.sale_id,
            s.sale_timestamp,
            s.total
          ])
        }
      };
    }

    // =========================
    // ❌ DEFAULT
    // =========================
    /**
     * Respuesta por defecto cuando no se reconoce la intención
     * @type {Object}
     * @property {string} type - "text" (respuesta de texto)
     * @property {string} content - Mensaje de error/ayuda
     */
    default:
      return {
        type: "text",
        content: "❌ No tengo una consulta definida para esa pregunta."
      };
  }
};

/**
 * Módulo de servicio para ejecución de consultas SQL
 * @module services/queryService
 * @description Servicio que ejecuta consultas SQL basadas en intenciones interpretadas.
 * Traduce estructuras de intención en consultas reales a la base de datos y
 * formatea los resultados en estructuras consistentes para el frontend.
 */
module.exports = { executeQuery };