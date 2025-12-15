const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware"); 
const checkRefreshCookie = require("../middlewares/checkRefreshCookie");
const { sendMessage } = require("../controllers/chatController");

router.post("/message", 
    authMiddleware.authenticate,   // Extrae y verifica token
    checkRefreshCookie,            // Si expiró, refresca con cookie  
    authMiddleware.isAuthenticated, // Verifica que esté autenticado
    sendMessage
);

module.exports = router;