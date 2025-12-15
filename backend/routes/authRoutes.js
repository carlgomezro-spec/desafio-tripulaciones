const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware');

// POST http://localhost:3000/api/auth/login
router.post('/login',loginValidator,handleValidationErrors, authController.login);

// POST http://localhost:3000/auth/refresh
router.post('/refresh', authController.refreshToken);

// POST http://localhost:3000/auth/logout
router.post('/logout', authMiddleware.authenticate, authController.logout);

module.exports = router;