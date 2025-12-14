const queries = {
  login: `
  SELECT 
    user_id, 
    role, 
    email, 
    password
  FROM users
  WHERE email = $1
`,
  
  getUserById: `
  SELECT 
    user_id,
    role,
    email
  FROM users
  WHERE user_id = $1
`
};

module.exports = queries; 