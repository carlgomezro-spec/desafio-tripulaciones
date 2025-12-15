const express = require("express");
const { verifyRefreshToken, createAccessToken } = require('../config/jsonwebtoken');

const checkRefreshCookie = express.Router();

checkRefreshCookie.use(async (req, res, next) => {
    if (!req.tokenExpired) {
        return next();
    }
    
    const refreshToken = req.cookies?.refresh_token;
    
    if (!refreshToken) {
        return res.status(401).json({ 
            success: false, 
            code: 'SESSION_EXPIRED',
            message: 'Sesión expirada. Por favor, inicia sesión nuevamente.' 
        });
    }
    
    try {
        const refreshData = verifyRefreshToken(refreshToken);
        
        const newAccessToken = createAccessToken({
            id_user: refreshData.id_user,
            email: refreshData.email,
            role: refreshData.role || 'user'
        });
        
        req.token = newAccessToken;
        req.user = {
            id_user: refreshData.id_user,
            email: refreshData.email,
            role: refreshData.role || 'user'
        };
        req.tokenExpired = false;
        
        res.set('X-New-Access-Token', newAccessToken);
        
        next();
        
    } catch (error) {
        res.clearCookie('refresh_token');
        
        return res.status(401).json({ 
            success: false, 
            code: 'INVALID_SESSION',
            message: 'Sesión inválida. Por favor, inicia sesión nuevamente.' 
        });
    }
});

module.exports = checkRefreshCookie;