const pool = require('../config/db');
const queries = require('../queries/hrQueries');

const getAllEmployees = async () => {
  try {
    const result = await pool.query(queries.getAllEmployees);
    return result.rows;
  } catch (error) {
    throw new Error('Error al obtener empleados: ' + error.message);
  }
};

const getEmployeeById = async (employee_id) => {  
  try {
    const result = await pool.query(queries.getEmployeeById, [employee_id]);
    if (result.rows.length === 0) {
      throw new Error(`Empleado con ID ${employee_id} no encontrado`);
    }
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener empleado por ID: ' + error.message);
  }
};

const getEmployeeByName = async (first_name) => {  
  try {
    const result = await pool.query(queries.getEmployeeByName, [first_name.toLowerCase()]);
    if (result.rows.length === 0) {
      throw new Error(`Empleado con nombre ${first_name} no encontrado`);
    }
    return result.rows;  
  } catch (error) {
    throw new Error('Error al obtener empleado por nombre: ' + error.message);
  }
};

const createEmployee = async (employeeData) => {
  const { employee_id, first_name, last_name, email, position, department, salary } = employeeData;
  
  try {
    if (!employee_id || !first_name || !last_name || !email || !position || !department || !salary) {
      throw new Error('Todos los campos son requeridos (employee_id, first_name, last_name, email, position, department, salary)');
    }
    
    const result = await pool.query(queries.createEmployee, [
      employee_id,
      first_name.toLowerCase(),
      last_name.toLowerCase(),
      email.toLowerCase(),  
      position.toLowerCase(),
      department.toLowerCase(),
      parseFloat(salary)
    ]);
    
    return {
      message: 'Empleado creado exitosamente',
      employee: result.rows[0]  
    };
  } catch (error) {
    throw new Error('Error al crear empleado: ' + error.message);
  }
};

const updateEmployeeById = async (employee_id, employeeData) => {  
  try {
    const existingEmployee = await pool.query(queries.getEmployeeById, [employee_id]);
    if (existingEmployee.rows.length === 0) {
      throw new Error(`Empleado con ID ${employee_id} no encontrado`);
    }
    
    const { first_name, last_name, email, position, department, salary } = employeeData;
    
    const updateData = {
      first_name: first_name ? first_name.toLowerCase() : existingEmployee.rows[0].first_name,
      last_name: last_name ? last_name.toLowerCase() : existingEmployee.rows[0].last_name,
      email: email ? email.toLowerCase() : existingEmployee.rows[0].email,  
      position: position ? position.toLowerCase() : existingEmployee.rows[0].position,
      department: department ? department.toLowerCase() : existingEmployee.rows[0].department,
      salary: salary ? parseFloat(salary) : existingEmployee.rows[0].salary
    };
    
    const result = await pool.query(queries.updateEmployeeById, [
      updateData.first_name,
      updateData.last_name,
      updateData.email,  
      updateData.position,
      updateData.department,
      updateData.salary,
      employee_id  
    ]);
    
    return {
      message: 'Empleado actualizado exitosamente',
      employee: result.rows[0]
    };
  } catch (error) {
    throw new Error('Error al actualizar empleado: ' + error.message);
  }
};

const deleteEmployeeById = async (employee_id) => {  
  try {
    const existingEmployee = await pool.query(queries.getEmployeeById, [employee_id]);
    if (existingEmployee.rows.length === 0) {
      throw new Error(`Empleado con ID ${employee_id} no encontrado`);
    }
    
    await pool.query(queries.deleteEmployeeById, [employee_id]);
    
    return {
      message: `Empleado con ID ${employee_id} eliminado exitosamente`,
      deletedEmployee: existingEmployee.rows[0]
    };
  } catch (error) {
    throw new Error('Error al eliminar empleado: ' + error.message);
  }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    getEmployeeByName,
    createEmployee,
    updateEmployeeById,
    deleteEmployeeById
};