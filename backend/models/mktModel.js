const pool = require('../config/db');
const queries = require('../queries/mktQueries');

/**
 * Modelo de datos para operaciones de Marketing con paginación
 * @module models/mktModel
 * @description Modelo que maneja consultas paginadas para ventas, clientes y productos.
 * Implementa paginación eficiente con conteo total de registros para interfaces de usuario.
 */

/**
 * Obtiene ventas paginadas del sistema
 * @async
 * @function getSalesPaginated
 * @memberof module:models/mktModel
 * @param {number} [page=1] - Número de página (1-indexed)
 * @param {number} [limit=10] - Número de elementos por página
 * @returns {Promise<Object>} Objeto con datos de ventas y metadatos de paginación
 * @throws {Error} Error al acceder a la base de datos
 * @description 
 * Implementa paginación eficiente con dos consultas:
 * 1. Obtiene los registros de la página actual (con LIMIT y OFFSET)
 * 2. Cuenta el total de registros para calcular total de páginas
 * 
 * Cálculo: offset = (page - 1) * limit
 * 
 * @example
 * // Obtener primera página con 10 elementos por defecto:
 * const resultado = await getSalesPaginated();
 * // Retorna: {
 * //   data: [...], // Array con hasta 10 ventas
 * //   pagination: {
 * //     page: 1,
 * //     limit: 10,
 * //     total: 150,      // Total de ventas en el sistema
 * //     totalPages: 15   // Math.ceil(150 / 10)
 * //   }
 * // }
 * 
 * @example
 * // Obtener página 3 con 20 elementos por página:
 * const resultado = await getSalesPaginated(3, 20);
 * // offset = (3-1)*20 = 40 → salta primeros 40 registros
 * // Retorna 20 registros a partir del registro 41
 */
const getSalesPaginated = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const salesResult = await pool.query(
      queries.getSalesPaginated,
      [limit, offset]
    );

    const countResult = await pool.query(queries.countSales);
    const total = Number(countResult.rows[0].total);

    return {
      data: salesResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error al mostrar las ventas: ${error.message}`);
  }
};

/**
 * Obtiene clientes paginados del sistema
 * @async
 * @function getCustomersPaginated
 * @memberof module:models/mktModel
 * @param {number} [page=1] - Número de página (1-indexed)
 * @param {number} [limit=10] - Número de elementos por página
 * @returns {Promise<Object>} Objeto con datos de clientes y metadatos de paginación
 * @throws {Error} Error al acceder a la base de datos
 * @description 
 * Misma estructura de paginación que getSalesPaginated pero para clientes.
 * Útil para interfaces que muestran listados largos de clientes.
 * 
 * @example
 * // Obtener segunda página con 15 clientes:
 * const resultado = await getCustomersPaginated(2, 15);
 * // offset = (2-1)*15 = 15 → salta primeros 15 clientes
 * // Retorna 15 clientes a partir del registro 16
 */
const getCustomersPaginated = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const customersResult = await pool.query(
      queries.getCustomersPaginated,
      [limit, offset]
    );

    const countResult = await pool.query(queries.countCustomers);
    const total = Number(countResult.rows[0].total);

    return {
      data: customersResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error al mostrar los clientes: ${error.message}`);
  }
};

/**
 * Obtiene productos paginados del sistema
 * @async
 * @function getProductsPaginated
 * @memberof module:models/mktModel
 * @param {number} [page=1] - Número de página (1-indexed)
 * @param {number} [limit=10] - Número de elementos por página
 * @returns {Promise<Object>} Objeto con datos de productos y metadatos de paginación
 * @throws {Error} Error al acceder a la base de datos
 * @description 
 * Paginación para catálogo de productos. Incluye información como:
 * - Nombre, categoría, precio, stock, etc.
 * - Metadatos para navegación (página actual, total de páginas)
 * 
 * @example
 * // Obtener productos para interfaz de catálogo:
 * const resultado = await getProductsPaginated(1, 12); // 12 productos por página
 * // Ideal para grids de productos (3x4, 4x3, etc.)
 */
const getProductsPaginated = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const productsResult = await pool.query(
      queries.getProductsPaginated,
      [limit, offset]
    );

    const countResult = await pool.query(queries.countProducts);
    const total = Number(countResult.rows[0].total);

    return {
      data: productsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error al mostrar los productos: ${error.message}`);
  }
};

module.exports = {
  getSalesPaginated,
  getCustomersPaginated,
  getProductsPaginated,
};