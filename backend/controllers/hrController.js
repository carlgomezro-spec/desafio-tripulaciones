const Hr = require('../models/hrModel.js');

module.exports = {
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