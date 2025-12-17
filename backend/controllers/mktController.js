const Mkt = require('../models/mktModel.js');

/**
 * Módulo de controladores para operaciones de Marketing (MKT)
 * @module controllers/mktController
 * @description Controlador para consultas paginadas de ventas, clientes y productos.
 * Proporciona endpoints para obtener datos de marketing con soporte de paginación.
 */
module.exports = {

  /**
   * Obtiene las ventas paginadas del sistema
   * @async
   * @function getSales
   * @param {Object} req - Objeto de petición de Express
   * @param {Object} req.query - Parámetros de consulta de la URL
   * @param {number} [req.query.page=1] - Número de página (1-indexed)
   * @param {number} [req.query.limit=10] - Número de elementos por página
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Datos paginados de ventas
   * @throws {Error} 500 - Error interno del servidor
   * @example
   * // GET /api/mkt/sales
   * // GET /api/mkt/sales?page=2&limit=20
   * // Respuesta exitosa (200):
   * {
   *   "success": true,
   *   "page": 2,
   *   "limit": 20,
   *   "totalItems": 150,
   *   "totalPages": 8,
   *   "data": [
   *     {
   *       "sale_id": 45,
   *       "date": "2024-01-15",
   *       "amount": 1250.50,
   *       "product_name": "Producto A",
   *       "customer_name": "Cliente X"
   *     },
   *     // ... más ventas (hasta 20)
   *   ]
   * }
   */
  getSales: async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await Mkt.getSalesPaginated(page, limit);

      res.json(result);
    } catch (err) {
      console.error('❌ getSales error:', err.message);
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Obtiene los clientes paginados del sistema
   * @async
   * @function getCustomers
   * @param {Object} req - Objeto de petición de Express
   * @param {Object} req.query - Parámetros de consulta de la URL
   * @param {number} [req.query.page=1] - Número de página (1-indexed)
   * @param {number} [req.query.limit=10] - Número de elementos por página
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Datos paginados de clientes
   * @throws {Error} 500 - Error interno del servidor
   * @example
   * // GET /api/mkt/customers
   * // GET /api/mkt/customers?page=3&limit=15
   * // Respuesta exitosa (200):
   * {
   *   "success": true,
   *   "page": 3,
   *   "limit": 15,
   *   "totalItems": 89,
   *   "totalPages": 6,
   *   "data": [
   *     {
   *       "customer_id": 101,
   *       "name": "Empresa XYZ",
   *       "email": "contacto@xyz.com",
   *       "total_purchases": 12500,
   *       "last_purchase": "2024-01-10"
   *     },
   *     // ... más clientes (hasta 15)
   *   ]
   * }
   */
  getCustomers: async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await Mkt.getCustomersPaginated(page, limit);

      res.json(result);
    } catch (err) {
      console.error('❌ getCustomers error:', err.message);
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Obtiene los productos paginados del sistema
   * @async
   * @function getProducts
   * @param {Object} req - Objeto de petición de Express
   * @param {Object} req.query - Parámetros de consulta de la URL
   * @param {number} [req.query.page=1] - Número de página (1-indexed)
   * @param {number} [req.query.limit=10] - Número de elementos por página
   * @param {Object} res - Objeto de respuesta de Express
   * @returns {Promise<Object>} Datos paginados de productos
   * @throws {Error} 500 - Error interno del servidor
   * @example
   * // GET /api/mkt/products
   * // GET /api/mkt/products?page=1&limit=5
   * // Respuesta exitosa (200):
   * {
   *   "success": true,
   *   "page": 1,
   *   "limit": 5,
   *   "totalItems": 42,
   *   "totalPages": 9,
   *   "data": [
   *     {
   *       "product_id": 7,
   *       "name": "Producto Premium",
   *       "category": "Electrónica",
   *       "price": 299.99,
   *       "stock": 45,
   *       "total_sales": 120
   *     },
   *     // ... más productos (hasta 5)
   *   ]
   * }
   */
  getProducts: async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await Mkt.getProductsPaginated(page, limit);

      res.json(result);
    } catch (err) {
      console.error('❌ getProducts error:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
};