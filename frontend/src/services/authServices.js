import api from './api';


// LOG IN
export const login = async (userData) => {
    try {
        const response = await api.post(`/login`,userData);
        // Guardar token en localStorage
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error) {
        throw error.response?.data || { msg: 'Error en login' };
    }
};

//LOG OUT
export const logout = async () => {
    try {  // Eliminar token local
        localStorage.removeItem('token');

        const response = await api.post(`/logout`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { msg: 'Error en logout' };
    }
};