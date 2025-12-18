const express = require("express");
const { verifyAccessToken } = require('../config/jsonwebtoken');

const decodeToken = express.Router();

decodeToken.use(async (req, res, next) => {
    if (!req.token) {
        const refreshToken = req.cookies?.refresh_token;
        
        if (refreshToken) {
            req.hasRefreshToken = true;
        }
        
        req.user = null;
        return next();
    }
    
    try {
        const decoded = verifyAccessToken(req.token);
        
        req.user = {
            id_user: decoded.id_user,
            email: decoded.email,
            role: decoded.role || 'user',
            name: decoded.name || '',
            surname: decoded.surname || ''
        };
        req.tokenExpired = false;
        
        return next();
        
    } catch (error) {
        if (error.message === 'ACCESS_TOKEN_EXPIRED') {
            req.tokenExpired = true;
            req.user = null;
        } else {
            req.user = null;
            req.tokenExpired = false;
        }
        return next();
    }
});

module.exports = decodeToken;