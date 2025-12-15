const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController.js');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRefreshCookie = require('../middlewares/checkRefreshCookie');

// // RUTAS SIN AUTENTICACIÓN PARA TESTING EN POSTMAN:
// // GET http://localhost:3000/api/hr/employees
// router.get('/employees', hrController.getAllEmployees);
// // GET http://localhost:3000/api/hr/employees/:employee_id
// router.get('/employees/:employee_id', hrController.getEmployeeById);
// // GET http://localhost:3000/api/hr/employees/name/:first_name
// router.get('/employees/name/:first_name', hrController.getEmployeeByName);
// // POST http://localhost:3000/api/hr/employees
// router.post('/employees', hrController.createEmployee);
// // PUT http://localhost:3000/api/hr/employees/:employee_id
// router.put('/employees/:employee_id', hrController.updateEmployeeById);
// // DELETE http://localhost:3000/api/hr/employees/:employee_id
// router.delete('/employees/:employee_id', hrController.deleteEmployeeById);

// RUTAS DEFINITIVAS CON AUTENTICACIÓN:

// GET http://localhost:3000/api/hr/employees
router.get('/employees', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireHR, hrController.getAllEmployees);

// GET http://localhost:3000/api/hr/employees/:employee_id
router.get('/employees/:employee_id', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireHR, hrController.getEmployeeById);

// GET http://localhost:3000/api/hr/employees/name/:first_name
router.get('/employees/name/:first_name', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireHR, hrController.getEmployeeByName);

// POST http://localhost:3000/api/hr/employees
router.post('/employees', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireHR, hrController.createEmployee);

// PUT http://localhost:3000/api/hr/employees/:employee_id
router.put('/employees/:employee_id', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireHR, hrController.updateEmployeeById);

// DELETE http://localhost:3000/api/hr/employees/:employee_id
router.delete('/employees/:employee_id', authMiddleware.authenticate, checkRefreshCookie, authMiddleware.requireHR, hrController.deleteEmployeeById);

module.exports = router;