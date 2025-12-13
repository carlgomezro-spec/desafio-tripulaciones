const pool = require('../config/db');
const queries = require('../queries/mktQueries');

const getSales = async () => {
  try {
    const result = await pool.query(queries.getSales);
    return result.rows;
  } catch (error) {
    throw new Error('Error al mostrar las ventas: ' + error.message);
  }
};

const getCustomers = async () => {
  try {
    const result = await pool.query(queries.getCustomers);
    return result.rows;
  } catch (error) {
    throw new Error('Error al mostrar los clientes: ' + error.message);
  }
};

const getProducts = async () => {
  try {
    const result = await pool.query(queries.getProducts);
    return result.rows;
  } catch (error) {
    throw new Error('Error al mostrar los productos: ' + error.message);
  }
};

module.exports = {
  getSales,
  getCustomers,
  getProducts
};