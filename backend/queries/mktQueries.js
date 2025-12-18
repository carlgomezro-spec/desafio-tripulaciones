/**
 * Conjunto de consultas SQL para operaciones de Marketing con paginación
 * @module queries/mktQueries
 * @description Consultas SQL para datos de marketing con soporte de paginación.
 * Incluye queries para ventas, clientes y productos con LIMIT/OFFSET y
 * queries separadas para conteo total de registros.
 */

/**
 * Objeto que contiene las queries SQL para el módulo de Marketing
 * @type {Object}
 * @property {string} getSalesPaginated - Query paginada para ventas
 * @property {string} countSales - Query para contar total de ventas
 * @property {string} getCustomersPaginated - Query paginada para clientes
 * @property {string} countCustomers - Query para contar total de clientes
 * @property {string} getProducts - Query no paginada para productos (legacy)
 * @property {string} getProductsPaginated - Query paginada para productos
 * @property {string} countProducts - Query para contar total de productos
 */
const queries = {
  /**
   * Obtener ventas paginadas con información relacionada
   * @name getSalesPaginated
   * @type {string}
   * @description Query paginada para obtener ventas con joins a clientes y productos.
   * Usa LIMIT y OFFSET para paginación. Ordena por fecha de venta descendente.
   * 
   * Parámetros:
   * - $1: limit (number) - Máximo de registros a retornar
   * - $2: offset (number) - Número de registros a saltar
   * 
   * Campos retornados:
   * - sale_id, employee_id, customer_id, first_name_customer, last_name_customer
   * - product_name, sales_channel, quantity, discount_percentage, subtotal
   * - discount_amount, total, payment_method, sale_timestamp
   * 
   * @example
   * // Uso en mktModel.getSalesPaginated():
   * const result = await pool.query(queries.getSalesPaginated, [10, 20]);
   * // Retorna máximo 10 ventas, saltando las primeras 20
   * // Ordenadas por fecha más reciente primero
   */
  getSalesPaginated: `
    SELECT 
      s.sale_id,
      s.employee_id,
      s.customer_id,
      c.first_name_customer,
      c.last_name_customer,
      p.product_name,
      s.sales_channel,
      s.quantity,
      s.discount_percentage,
      s.subtotal,
      s.discount_amount,
      s.total,
      s.payment_method,
      s.sale_timestamp
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.customer_id
    LEFT JOIN products p ON s.product_id = p.product_id
    ORDER BY s.sale_timestamp DESC
    LIMIT $1 OFFSET $2
  `,
 
  /**
   * Contar el total de ventas en el sistema
   * @name countSales
   * @type {string}
   * @description Query para obtener el número total de registros en la tabla sales.
   * Se combina con getSalesPaginated para calcular totalPages en la paginación.
   * 
   * Campos retornados:
   * - total (number) - Número total de ventas
   * 
   * @example
   * // Uso en mktModel.getSalesPaginated():
   * const countResult = await pool.query(queries.countSales);
   * const total = Number(countResult.rows[0].total); // Ej: 150
   */
  countSales: ` 
  SELECT COUNT(*) AS total
  FROM sales
`,

  /**
   * Obtener clientes paginados del sistema
   * @name getCustomersPaginated
   * @type {string}
   * @description Query paginada para obtener información básica de clientes.
   * Ordena alfabéticamente por apellido y nombre.
   * 
   * Parámetros:
   * - $1: limit (number) - Máximo de registros a retornar
   * - $2: offset (number) - Número de registros a saltar
   * 
   * Campos retornados:
   * - customer_id, first_name_customer, last_name_customer, email, region
   * 
   * @example
   * // Uso en mktModel.getCustomersPaginated():
   * const result = await pool.query(queries.getCustomersPaginated, [15, 30]);
   * // Retorna máximo 15 clientes, saltando los primeros 30
   * // Ordenados alfabéticamente
   */
  getCustomersPaginated: `
  SELECT
    customer_id,
    first_name_customer,
    last_name_customer,
    email,
    region
  FROM customers
  ORDER BY last_name_customer, first_name_customer
  LIMIT $1 OFFSET $2
`,

  /**
   * Contar el total de clientes en el sistema
   * @name countCustomers
   * @type {string}
   * @description Query para obtener el número total de clientes registrados.
   * 
   * Campos retornados:
   * - total (number) - Número total de clientes
   * 
   * @example
   * // Uso combinado:
   * const countResult = await pool.query(queries.countCustomers);
   * const total = Number(countResult.rows[0].total);
   */
  countCustomers: `
  SELECT COUNT(*) AS total
  FROM customers
`,
  
  /**
   * Obtener todos los productos (query no paginada - legacy)
   * @name getProducts
   * @type {string}
   * @description Query original para obtener productos sin paginación.
   * Mantenida por compatibilidad. Usar getProductsPaginated para paginación.
   * 
   * Campos retornados:
   * - product_id, product_name, category, unit_price
   * 
   * @deprecated
   * Considerar usar getProductsPaginated para consistencia con otras queries.
   */
  getProducts: `
    SELECT 
      product_id,
      product_name,
      category,
      unit_price
    FROM products
    ORDER BY product_name
  `,

  /**
   * Obtener productos paginados del catálogo
   * @name getProductsPaginated
   * @type {string}
   * @description Query paginada para obtener información de productos.
   * Ordena alfabéticamente por nombre de producto.
   * 
   * Parámetros:
   * - $1: limit (number) - Máximo de registros a retornar
   * - $2: offset (number) - Número de registros a saltar
   * 
   * Campos retornados:
   * - product_id, product_name, category, unit_price
   * 
   * @example
   * // Uso en mktModel.getProductsPaginated():
   * const result = await pool.query(queries.getProductsPaginated, [20, 0]);
   * // Retorna los primeros 20 productos ordenados alfabéticamente
   */
  getProductsPaginated: `
  SELECT
    product_id,
    product_name,
    category,
    unit_price
  FROM products
  ORDER BY product_name
  LIMIT $1 OFFSET $2
`,

  /**
   * Contar el total de productos en el catálogo
   * @name countProducts
   * @type {string}
   * @description Query para obtener el número total de productos.
   * 
   * Campos retornados:
   * - total (number) - Número total de productos
   * 
   * @example
   * // Para calcular paginación:
   * const countResult = await pool.query(queries.countProducts);
   * const total = Number(countResult.rows[0].total);
   * const totalPages = Math.ceil(total / limit);
   */
  countProducts: `
  SELECT COUNT(*) AS total
  FROM products
`
};

module.exports = queries;