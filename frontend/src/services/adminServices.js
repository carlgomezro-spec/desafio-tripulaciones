import api from './api';


// GET http://localhost:3000/api/users (ALL)
// GET http://localhost:3000/api/users/name (NAME)
// POST http://localhost:3000/api/users (CREATE USER)
// PUT http://localhost:3000/api/users/:id (EDIT USER)
// DELETE http://localhost:3000/api/users/:id (DELETE USER)

// GET http://localhost:3000/api/mkt
// GET http://localhost:3000/api/hr

//GET ALL USERS
export const getAllUsers = async () => {
    try {
        const response = await api.get(`/users`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
    }
};

//GET USERS BY NAME
export const getUserByName = async(first_name)=>{


    try {
        const response = await api.get(`/users/name/${first_name}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user by name:', error);
        throw error;
    }  
}

//POST USER -> Create

export const createUser = async (userData) => {
    try {
        const response = await api.post(`/users`,userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { msg: 'Error creating new user' };
    }
};

//DELETE
export const deleteUserById = async (user_id) => {
    try {
        const response = await api.delete(`/users/${user_id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { msg: 'Error delete user' };
    }
};

//EDIT

export const updateUserById = async (user_id, userData) => {
    try {
        const response = await api.put(`/users/${user_id}`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { msg: 'Error edit user' };
    }
};

