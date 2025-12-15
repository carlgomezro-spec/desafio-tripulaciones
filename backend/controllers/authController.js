const Auth = require('../models/authModel');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../config/jsonwebtoken'); 

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

            const accessToken = createAccessToken({
                user_id: user.user_id,
                role: user.role,
                email: user.email,
                name: user.name || '',
                surname: user.surname || ''
            });

            const refreshToken = createRefreshToken({
                user_id: user.user_id,
                email: user.email,
                role: user.role
            });

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api'
            });
            
            return res.status(200).json({
                success: true,
                accessToken,
                expiresIn: 900,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                    name: user.name || '',
                    surname: user.surname || ''
                }
            });

        } catch (err) {
            console.error('Error en login:', err);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    },

    refreshToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refresh_token;
            
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token requerido',
                    code: 'REFRESH_TOKEN_REQUIRED'
                });
            }
            
            let decoded;
            
            try {
                decoded = verifyRefreshToken(refreshToken);
            } catch (error) {
                if (error.message === 'REFRESH_TOKEN_EXPIRED' || error.message === 'Token expirado') {
                    res.clearCookie('refresh_token', {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        path: '/api'
                    });
                    
                    return res.status(401).json({
                        success: false,
                        message: 'Sesión expirada. Por favor inicie sesión nuevamente.',
                        code: 'SESSION_EXPIRED'
                    });
                }
                
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token inválido',
                    code: 'INVALID_REFRESH_TOKEN'
                });
            }
            
            const userResult = await Auth.getUserById(decoded.user_id);
            
            if (userResult.length === 0) {
                res.clearCookie('refresh_token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/api'
                });
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }
            
            const user = userResult[0];
            
            const newAccessToken = createAccessToken({
                user_id: user.user_id,
                role: user.role,
                email: user.email,
                name: user.name || '',
                surname: user.surname || ''
            });
            
            const newRefreshToken = createRefreshToken({
                user_id: user.user_id,
                email: user.email,
                role: user.role
            });
            
            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/api'
            });
            
            return res.json({
                success: true,
                accessToken: newAccessToken,
                expiresIn: 900,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                    name: user.name || '',
                    surname: user.surname || ''
                }
            });
            
        } catch (error) {
            console.error('Error en refresh token:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    logout: (req, res) => {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api'
        });
        
        return res.json({
            success: true,
            message: 'Sesión cerrada exitosamente.'
        });
    }
};