const queries = {
  // Obtener todas las ventas
  getSales: `
    SELECT 
      s.sale_id,
      s.employee_id,
      s.customer_id,
      c.first_name_customer,
      c.last_name_customer,
      s.product_id,
      p.product_name,
      s.sales_channel,
      s.quantity,
      s.discount_percentage,
      s.payment_method,
      s.subtotal,
      s.discount_amount,
      s.total,
      s.hour,
      s.day,
      s.month,
      s.year
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.customer_id
    LEFT JOIN products p ON s.product_id = p.product_id
    ORDER BY s.year DESC, s.month DESC, s.day DESC, s.hour DESC
  `,
  
  // Obtener todos los clientes
  getCustomers: `
    SELECT 
      customer_id,
      first_name_customer,
      last_name_customer,
      email_customer,
      region
    FROM customers
    ORDER BY last_name_customer, first_name_customer
  `,
  
  // Obtener todos los productos
  getProducts: `
    SELECT 
      product_id,
      product_name,
      category,
      unit_price
    FROM products
    ORDER BY product_name
  `
};

module.exports = queries;