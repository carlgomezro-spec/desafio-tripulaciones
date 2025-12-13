const Auth = require('../models/authModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jsonwebtoken.js'); 

module.exports = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Email y contraseña son requeridos' 
                });
            }

            const userResult = await Auth.login(email, password);
            
            if (userResult.length === 0) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Credenciales inválidas' 
                });
            }

            const user = userResult[0];
            
            const token = jwt.sign(
                { 
                    employee_id: user.employee_id, 
                    role: user.role,
                    email: user.email,
                    user_id: user.user_id
                },
                jwtConfig.secret,
                { expiresIn: jwtConfig.expiresIn }
            );

            res.json({
                success: true,
                token,
                user: {
                    user_id: user.user_id,
                    employee_id: user.employee_id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (err) {
            console.error('Error en login:', err);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor',
                error: err.message 
            });
        }
    }, 
    
    logout: (req, res) => {
        try {
            res.json({ 
                success: true,
                message: 'Sesión cerrada exitosamente.'
            });
        } catch (err) {
            res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
    }
};