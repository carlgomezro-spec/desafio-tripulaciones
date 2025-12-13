const queries = {
  getAllEmployees: `
    SELECT 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
    FROM employees
    ORDER BY department, last_name, first_name
  `,
  
  getEmployeeById: `
    SELECT 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
    FROM employees
    WHERE employee_id = $1
  `,
  
  getEmployeeByName: `
    SELECT 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
    FROM employees
    WHERE LOWER(first_name) LIKE $1 
       OR LOWER(last_name) LIKE $1
    ORDER BY last_name, first_name
  `,
  
  createEmployee: `
    INSERT INTO employees (
      employee_id, 
      first_name, 
      last_name,
      email,
      position, 
      department, 
      salary
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
  `,
  
  updateEmployeeById: `
    UPDATE employees 
    SET 
      first_name = $1,
      last_name = $2,
      email = $3,
      position = $4,
      department = $5,
      salary = $6
    WHERE employee_id = $7
    RETURNING 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
  `,
  
  deleteEmployeeById: `
    DELETE FROM employees 
    WHERE employee_id = $1
    RETURNING 
      employee_id,
      first_name,
      last_name,
      email,
      position,
      department,
      salary
  `
};

module.exports = queries; 