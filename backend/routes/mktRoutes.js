const express = require('express');
const router = express.Router();
const mktController = require('../controllers/mktController.js');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRefreshCookie = require('../middlewares/checkRefreshCookie');

// // RUTAS SIN AUTENTICACIÓN PARA TESTING EN POSTMAN:
// // GET http://localhost:3000/api/mkt/sales
// router.get('/sales', mktController.getSales);
// // GET http://localhost:3000/api/mkt/customers
// router.get('/customers', mktController.getCustomers);
// // GET http://localhost:3000/api/mkt/products
// router.get('/products', mktController.getProducts);

// RUTAS DEFINITIVAS CON AUTENTICACIÓN:

// GET http://localhost:3000/api/mkt/sales
router.get('/sales', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireMarketing, mktController.getSales);

// GET http://localhost:3000/api/mkt/customers
router.get('/customers', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireMarketing, mktController.getCustomers);

// GET http://localhost:3000/api/mkt/products
router.get('/products', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireMarketing, mktController.getProducts);

module.exports = router;