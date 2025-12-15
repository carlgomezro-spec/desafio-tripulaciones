import api from './api.js';

export const login = async (userData) => {
    try {
        const response = await api.post(`auth/login`, userData);
        
        const accessToken = response.data.accessToken || response.data.token;
        
        if (!accessToken) {
            throw new Error('El servidor no devolvió un token');
        }
        
        localStorage.setItem('token', accessToken);
        
        return response.data;
        
    } catch (error) {
        console.error('Error en login:', error);
        throw error.response?.data || { message: 'Error en login' };
    }
};