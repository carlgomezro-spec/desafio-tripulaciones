const express = require('express');
const router = express.Router();
const mktController = require('../controllers/mktController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const departmentMiddleware = require('../middlewares/departmentMiddleware.js');
const getAccessToken = require('../middlewares/getAccessToken.js');
const decodeToken = require('../middlewares/decodeToken.js');

// RUTAS SIN AUTENTICACIÓN PARA TESTING EN POSTMAN:

// GET http://localhost:3000/api/mkt/sales
router.get('/sales', mktController.getSales);
// GET http://localhost:3000/api/mkt/customers
router.get('/customers', mktController.getCustomers);
// GET http://localhost:3000/api/mkt/products
router.get('/products', mktController.getProducts);

// RUTAS DEFINITIVAS CON AUTENTICACIÓN:

// GET http://localhost:3000/api/mkt/sales
// router.get('/sales', getAccessToken, decodeToken, authMiddleware, departmentMiddleware.isMKT, mktController.getSales);

// GET http://localhost:3000/api/mkt/customers
// router.get('/customers', getAccessToken, decodeToken, authMiddleware, departmentMiddleware.isMKT, mktController.getCustomers);

// GET http://localhost:3000/api/mkt/products
// router.get('/products', getAccessToken, decodeToken, authMiddleware, departmentMiddleware.isMKT, mktController.getProducts);

module.exports = router;