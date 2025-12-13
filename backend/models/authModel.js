const pool = require('../config/db');
const queries = require('../queries/authQueries');
const bcrypt = require('bcrypt'); 

const login = async (email, password) => {
    try {
        const result = await pool.query(queries.login, [email]);
        
        if (result.rows.length === 0) {
            return [];
        }
        
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return [];
        }
        
        const { password: _, ...userWithoutPassword } = user;
        return [userWithoutPassword];
        
    } catch (error) {
        throw error;
    }
};

const logout = async (user_id) => {
    try {

        if (!user_id) {
            throw new Error('user_id es requerido');
        }
        
        return {
            success: true,
            message: 'Sesión cerrada exitosamente',
            user_id: user_id,
            logout_time: new Date().toISOString()
        };
        
    } catch (error) {
        throw new Error('Error durante el logout: ' + error.message);
    }
};

module.exports = {
    login,
    logout
};