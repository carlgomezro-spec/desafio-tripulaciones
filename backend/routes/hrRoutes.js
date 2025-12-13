const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController.js');
// const authMiddleware = require('../middlewares/authMiddleware.js');
// const departmentMiddleware = require('../middlewares/departmentMiddleware.js');
// const getAccessToken = require('../middlewares/getAccessToken.js');
// const decodeToken = require('../middlewares/decodeToken.js');

// RUTAS SIN AUTENTICACIÓN PARA TESTING EN POSTMAN:

// GET http://localhost:3000/api/hr/employees
router.get('/employees', hrController.getAllEmployees);
// GET http://localhost:3000/api/hr/employees/:employee_id
router.get('/employees/:employee_id', hrController.getEmployeeById);
// GET http://localhost:3000/api/hr/employees/name/:first_name
router.get('/employees/name/:first_name', hrController.getEmployeeByName);
// POST http://localhost:3000/api/hr/employees
router.post('/employees', hrController.createEmployee);
// PUT http://localhost:3000/api/hr/employees/:employee_id
router.put('/employees/:employee_id', hrController.updateEmployeeById);
// DELETE http://localhost:3000/api/hr/employees/:employee_id
router.delete('/employees/:employee_id', hrController.deleteEmployeeById);

// RUTAS DEFINITIVAS CON AUTENTICACIÓN:

// // GET http://localhost:3000/api/hr/employees
// router.get('/employees', getAccessToken, decodeToken, authMiddleware, departmentMiddleware.isHR, hrController.getAllEmployees);

// // GET http://localhost:3000/api/hr/employees/:employee_id
// router.get('/employees/:employee_id', getAccessToken, decodeToken, authMiddleware, departmentMiddleware.isHR, hrController.getEmployeeById);

// // GET http://localhost:3000/api/hr/employees/name/:first_name
// router.get('/employees/name/:first_name', getAccessToken, decodeToken, authMiddleware, departmentMiddleware.isHR, hrController.getEmployeeByName);

// // POST http://localhost:3000/api/hr/employees
// router.post('/employees', getAccessToken, decodeToken, authMiddleware, departmentMiddleware.isHR, hrController.createEmployee);

// // PUT http://localhost:3000/api/hr/employees/:employee_id
// router.put('/employees/:employee_id', getAccessToken, decodeToken, authMiddleware, departmentMiddleware.isHR, hrController.updateEmployeeById);

// // DELETE http://localhost:3000/api/hr/employees/:employee_id
// router.delete('/employees/:employee_id', getAccessToken, decodeToken, authMiddleware, departmentMiddleware.isHR, hrController.deleteEmployeeById);

module.exports = router;