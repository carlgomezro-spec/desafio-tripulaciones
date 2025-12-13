const queries = {
  login: `
    SELECT 
      u.user_id, 
      u.employee_id, 
      u.role, 
      u.email, 
      u.password,
      e.first_name,
      e.last_name
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.employee_id
    WHERE u.email = $1
  `,
  
  getUserById: `
    SELECT 
      user_id, 
      employee_id, 
      role, 
      email 
    FROM users 
    WHERE user_id = $1
  `
};

module.exports = queries; 