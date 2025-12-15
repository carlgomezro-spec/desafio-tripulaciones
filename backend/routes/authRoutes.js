const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginValidator } = require('../validators/authValidator.js');
const handleValidationErrors = require('../middlewares/validate.js');

// POST http://localhost:3000/api/auth/login
router.post('/login', loginValidator, handleValidationErrors, authController.login);

// POST http://localhost:3000/auth/refresh
router.post('/refresh', authController.refreshToken);

// POST http://localhost:3000/auth/logout
router.post('/logout', authMiddleware.authenticate, authController.logout);

module.exports = router;