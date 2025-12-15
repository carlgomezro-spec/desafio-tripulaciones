const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.js');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRefreshCookie = require('../middlewares/checkRefreshCookie');
const { createUserValidator, updateUserValidator } = require('../validators/userValidator.js');
const handleValidationErrors = require('../middlewares/validate.js');

// // RUTAS SIN AUTENTICACIÓN PARA TESTING EN POSTMAN:
// // GET http://localhost:3000/api/admin/sales
// router.get('/sales', adminController.getSales);
// // GET http://localhost:3000/api/admin/customers
// router.get('/customers', adminController.getCustomers);
// // GET http://localhost:3000/api/admin/products
// router.get('/products', adminController.getProducts);
// // GET http://localhost:3000/api/admin/hr
// router.get('/hr', adminController.getHr);
// // GET http://localhost:3000/api/admin/users
// router.get('/users', adminController.getAllUsers);
// // GET http://localhost:3000/api/admin/users/:user_id
// router.get('/users/:user_id', adminController.getUserById);
// // POST http://localhost:3000/api/admin/users
// router.post('/users', adminController.createUser);
// // PUT http://localhost:3000/api/admin/users/:user_id
// router.put('/users/:user_id', adminController.updateUserById);
// // DELETE http://localhost:3000/api/admin/users/:user_id
// router.delete('/users/:user_id', adminController.deleteUserById);

// RUTAS DEFINITIVAS CON AUTENTICACIÓN:

// GET http://localhost:3000/api/admin/sales
router.get('/sales', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireAdmin, adminController.getSales);

// GET http://localhost:3000/api/admin/customers
router.get('/customers', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireAdmin, adminController.getCustomers);

// GET http://localhost:3000/api/admin/products
router.get('/products', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireAdmin, adminController.getProducts);

// GET http://localhost:3000/api/admin/hr
router.get('/hr', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireAdmin, adminController.getHr);

// GET http://localhost:3000/api/admin/users
router.get('/users', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireAdmin, adminController.getAllUsers);

// GET http://localhost:3000/api/admin/users/:user_id
router.get('/users/:user_id', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireAdmin, adminController.getUserById);

// POST http://localhost:3000/api/admin/users
router.post('/users', createUserValidator, handleValidationErrors, authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireAdmin, adminController.createUser);

// PUT http://localhost:3000/api/admin/users/:user_id
router.put('/users/:user_id', updateUserValidator, handleValidationErrors, authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireAdmin, adminController.updateUserById);

// DELETE http://localhost:3000/api/admin/users/:user_id
router.delete('/users/:user_id', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireAdmin, adminController.deleteUserById);

module.exports = router;