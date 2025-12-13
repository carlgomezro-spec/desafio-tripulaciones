const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController.js');
const getAccessToken = require('../middlewares/getAccessToken.js');
const decodeToken = require('../middlewares/decodeToken.js');

// POST http://localhost:3000/auth/login
router.post('/login', authController.login);

// POST http://localhost:3000/auth/logout
router.post('/logout', getAccessToken, decodeToken, authController.logout);

module.exports = router;
