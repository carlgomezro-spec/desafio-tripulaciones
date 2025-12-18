const Hr = require('../models/hrModel.js');

/**
 * Módulo de controladores para gestión de Recursos Humanos (HR)
 * @module controllers/hrController
 * @description Controlador CRUD para la gestión de empleados.
 * Proporciona endpoints para crear, leer, actualizar y eliminar registros de empleados.
 */
module.exports = {
    /**
     * Obtiene todos los empleados del sistema
     * @async
     * @function getAllEmployees
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<Object>} Lista de empleados en formato JSON
     * @throws {Error} 500 - Error interno del servidor
     * @example
     * // GET /api/hr/employees
     * // Respuesta exitosa (200):
     * {
     *   "success": true,
     *   "count": 45,
     *   "data": [
     *     { "employee_id": 1, "first_name": "Juan", ... },
     *     { "employee_id": 2, "first_name": "María", ... }
     *   ]
     * }
     */
    getAllEmployees: async (req, res) => {
        try {
            const employees = await Hr.getAllEmployees();  
            res.json({
                success: true,
                count: employees.length,
                data: employees
            });
        } catch (err) {
            res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Obtiene un empleado específico por su ID
     * @async
     * @function getEmployeeById
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de la URL
     * @param {string} req.params.employee_id - ID numérico del empleado
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<Object>} Datos del empleado en formato JSON
     * @throws {Error} 404 - Empleado no encontrado
     * @example
     * // GET /api/hr/employees/123
     * // Respuesta exitosa (200):
     * {
     *   "success": true,
     *   "data": {
     *     "employee_id": 123,
     *     "first_name": "Ana",
     *     "last_name": "García",
     *     "department": "Marketing",
     *     "position": "Gerente"
     *   }
     * }
     */
    getEmployeeById: async (req, res) => {
        try {
            const { employee_id } = req.params;  
            const employee = await Hr.getEmployeeById(employee_id);  
            
            if (!employee) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Empleado no encontrado' 
                });
            }
            
            res.json({
                success: true,
                data: employee
            });
        } catch (err) {
            res.status(404).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Busca empleados por su nombre (coincidencia parcial)
     * @async
     * @function getEmployeeByName
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de la URL
     * @param {string} req.params.first_name - Nombre o parte del nombre a buscar
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<Object>} Lista de empleados que coinciden con el nombre
     * @throws {Error} 404 - No se encontraron empleados con ese nombre
     * @example
     * // GET /api/hr/employees/name/Carlos
     * // Respuesta exitosa (200):
     * {
     *   "success": true,
     *   "count": 3,
     *   "data": [
     *     { "employee_id": 1, "first_name": "Carlos", ... },
     *     { "employee_id": 2, "first_name": "Carlos", ... }
     *   ]
     * }
     */
    getEmployeeByName: async (req, res) => {
        try {
            const { first_name } = req.params;  
            const employees = await Hr.getEmployeeByName(first_name);  
            
            if (employees.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Empleado no encontrado' 
                });
            }
            
            res.json({
                success: true,
                count: employees.length,
                data: employees
            });
        } catch (err) {
            res.status(404).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Crea un nuevo empleado en el sistema
     * @async
     * @function createEmployee
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.body - Datos del nuevo empleado
     * @param {string} req.body.first_name - Nombre del empleado (requerido)
     * @param {string} req.body.last_name - Apellido del empleado (requerido)
     * @param {string} req.body.email - Email corporativo (requerido)
     * @param {string} req.body.department - Departamento (requerido)
     * @param {string} req.body.position - Cargo/Posición (requerido)
     * @param {Date} [req.body.hire_date] - Fecha de contratación
     * @param {number} [req.body.salary] - Salario
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<Object>} Confirmación de creación
     * @throws {Error} 400 - Datos del empleado requeridos o inválidos
     * @example
     * // POST /api/hr/employees
     * // Body:
     * {
     *   "first_name": "Laura",
     *   "last_name": "Martínez",
     *   "email": "laura.martinez@empresa.com",
     *   "department": "Tecnología",
     *   "position": "Desarrolladora Senior",
     *   "hire_date": "2024-01-15",
     *   "salary": 55000
     * }
     * // Respuesta exitosa (201):
     * {
     *   "success": true,
     *   "employee_id": 456,
     *   "message": "Empleado creado exitosamente"
     * }
     */
    createEmployee: async (req, res) => {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos del empleado requeridos'
                });
            }
            
            const result = await Hr.createEmployee(req.body);  
            
            res.status(201).json(result);
        } catch (err) {
            console.error('Error al crear empleado:', err);
            res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Actualiza los datos de un empleado existente
     * @async
     * @function updateEmployeeById
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de la URL
     * @param {string} req.params.employee_id - ID del empleado a actualizar
     * @param {Object} req.body - Campos a actualizar (parcial o completo)
     * @param {string} [req.body.first_name] - Nuevo nombre
     * @param {string} [req.body.last_name] - Nuevo apellido
     * @param {string} [req.body.department] - Nuevo departamento
     * @param {string} [req.body.position] - Nueva posición
     * @param {number} [req.body.salary] - Nuevo salario
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<Object>} Confirmación de actualización
     * @throws {Error} 400 - ID de empleado requerido o datos inválidos
     * @example
     * // PUT /api/hr/employees/123
     * // Body:
     * {
     *   "department": "Innovación",
     *   "position": "Líder de Proyecto",
     *   "salary": 60000
     * }
     * // Respuesta exitosa (200):
     * {
     *   "success": true,
     *   "message": "Empleado actualizado exitosamente",
     *   "updated_fields": ["department", "position", "salary"]
     * }
     */
    updateEmployeeById: async (req, res) => {
        try {
            const { employee_id } = req.params;  
            
            if (!employee_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de empleado requerido'
                });
            }
            
            const result = await Hr.updateEmployeeById(employee_id, req.body);  
            
            res.json(result);
        } catch (err) {
            console.error('Error al actualizar empleado:', err);
            res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
    },

    /**
     * Elimina un empleado del sistema por su ID
     * @async
     * @function deleteEmployeeById
     * @param {Object} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de la URL
     * @param {string} req.params.employee_id - ID del empleado a eliminar
     * @param {Object} res - Objeto de respuesta de Express
     * @returns {Promise<Object>} Confirmación de eliminación
     * @throws {Error} 400 - ID de empleado requerido
     * @example
     * // DELETE /api/hr/employees/123
     * // Respuesta exitosa (200):
     * {
     *   "success": true,
     *   "message": "Empleado eliminado exitosamente",
     *   "employee_id": 123
     * }
     */
    deleteEmployeeById: async (req, res) => {
        try {
            const { employee_id } = req.params; 
            
            if (!employee_id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de empleado requerido'
                });
            }
            
            const result = await Hr.deleteEmployeeById(employee_id); 
            
            res.json(result);
        } catch (err) {
            console.error('Error al eliminar empleado:', err);
            res.status(400).json({ 
                success: false,
                error: err.message 
            });
        }
    }
};