const pool = require("../config/db");

const executeQuery = async (intentData, dateRange = null) => {
  const { intent } = intentData;

  switch (intent) {

    // =========================
    // 👥 EMPLEADOS (KPI)
    // =========================
    case "employee_count": {
      const result = await pool.query(
        "SELECT COUNT(*) AS total FROM employees"
      );

      return {
        type: "summary",
        content: "Total de empleados",
        data: { total: Number(result.rows[0].total) }
      };
    }

    // =========================
    // 👥 EMPLEADOS (TABLA)
    // =========================
    case "employee_list": {
      const result = await pool.query(`
        SELECT employee_id, first_name, last_name, department
        FROM employees
        ORDER BY last_name
        LIMIT 20
      `);

      return {
        type: "table",
        content: "Listado de empleados",
        data: {
          headers: ["ID", "Nombre", "Apellido", "Departamento"],
          rows: result.rows.map(e => [
            e.employee_id,
            e.first_name,
            e.last_name,
            e.department
          ])
        }
      };
    }

    // =========================
    // 📦 PRODUCTOS (TABLA)
    // =========================
    case "product_list": {
      const result = await pool.query(`
        SELECT product_id, product_name, category, unit_price
        FROM products
        ORDER BY product_name
        LIMIT 20
      `);

      return {
        type: "table",
        content: "Listado de productos",
        data: {
          headers: ["ID", "Producto", "Categoría", "Precio"],
          rows: result.rows.map(p => [
            p.product_id,
            p.product_name,
            p.category,
            p.unit_price
          ])
        }
      };
    }

    // =========================
    // 👤 CLIENTES (TABLA)
    // =========================
    case "customer_list": {
      const result = await pool.query(`
        SELECT 
          customer_id,
          first_name_customer,
          last_name_customer,
          region
        FROM customers
        ORDER BY last_name_customer
        LIMIT 20
      `);

      return {
        type: "table",
        content: "Listado de clientes",
        data: {
          headers: ["ID", "Cliente", "Región"],
          rows: result.rows.map(c => [
            c.customer_id,
            `${c.first_name_customer} ${c.last_name_customer}`,
            c.region
          ])
        }
      };
    }

    // =========================
    // 💰 VENTAS (KPI)
    // =========================
    case "sales_total": {
      if (!dateRange) {
        throw new Error("dateRange is required for sales_total");
      }

      const result = await pool.query(
        `
        SELECT COALESCE(SUM(total), 0) AS total
        FROM sales
        WHERE sale_timestamp BETWEEN $1 AND $2
        `,
        [dateRange.from, dateRange.to]
      );

      return {
        type: "summary",
        content: "Total de ventas",
        data: { total: Number(result.rows[0].total) }
      };
    }

    // =========================
    // 💰 VENTAS (TABLA)
    // =========================
    case "sales_list": {
      if (!dateRange) {
        throw new Error("dateRange is required for sales_list");
      }

      const result = await pool.query(
        `
        SELECT sale_id, sale_timestamp, total
        FROM sales
        WHERE sale_timestamp BETWEEN $1 AND $2
        ORDER BY sale_timestamp DESC
        LIMIT 20
        `,
        [dateRange.from, dateRange.to]
      );

      return {
        type: "table",
        content: "Listado de ventas",
        data: {
          headers: ["ID", "Fecha", "Importe"],
          rows: result.rows.map(s => [
            s.sale_id,
            s.sale_timestamp,
            s.total
          ])
        }
      };
    }

    // =========================
    // ❌ DEFAULT
    // =========================
    default:
      return {
        type: "text",
        content: "❌ No tengo una consulta definida para esa pregunta."
      };
  }
};

module.exports = { executeQuery };
