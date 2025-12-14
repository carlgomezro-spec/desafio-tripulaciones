const Auth = require('../models/authModel');
const { createToken } = require('../config/jsonwebtoken');

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

            const token = createToken({
                user_id: user.user_id,
                role: user.role,
                email: user.email
            });

            return res.status(200).json({
                success: true,
                token,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (err) {
            console.error('Error en login:', err);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    logout: (req, res) => {
        return res.json({
            success: true,
            message: 'Sesión cerrada exitosamente.'
        });
    }
};
