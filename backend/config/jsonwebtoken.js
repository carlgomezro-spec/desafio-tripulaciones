const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || SECRET + '_REFRESH';

if (!SECRET) {
    throw new Error('JWT_SECRET no configurado');
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, SECRET, {
        expiresIn: '15m'
    });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: '7d'
    });
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('ACCESS_TOKEN_EXPIRED');
        }
        throw error;
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, REFRESH_SECRET);
    } catch (error) {
        throw new Error('REFRESH_TOKEN_INVALID');
    }
};

const createToken = (payload, expirationTime = "10min") => {
    return jwt.sign(payload, SECRET, {
        expiresIn: expirationTime
    });
};

const decodeToken = (token) => {
    try {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } catch (error) {
        return null;
    }
};

module.exports = { 
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    createToken,
    decodeToken
};