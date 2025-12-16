import { useEffect, useState } from "react";
import {
  getAllEmployees,
  deleteEmployeeById
} from "../../../../services/hrservice";

const HrPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list"); // "list" | "add"

  /* =====================
     FETCH EMPLOYEES
  ===================== */
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployees();
      setEmployees(data.data || []);
    } catch (err) {
      setError(err.msg || "Error loading employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* =====================
     DELETE EMPLOYEE
  ===================== */
  const handleDelete = async (employee_id) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este empleado?"
    );
    if (!confirmDelete) return;

    try {
      await deleteEmployeeById(employee_id);
      fetchEmployees();
    } catch (err) {
      alert(err.msg || "Error deleting employee");
    }
  };

  /* =====================
     RENDER
  ===================== */
  if (loading) return <p>Cargando empleados...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
        <h1>Recursos Humanos</h1>
        <p>Gestión de empleados</p>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => setView("list")}>
            📋 Ver empleados
          </button>

          <button
            onClick={() => setView("add")}
            style={{ marginLeft: "1rem" }}
          >
            ➕ Añadir empleado
          </button>
        </div>
      </div>

      {/* =====================
          LISTADO EMPLEADOS
      ===================== */}
      {view === "list" && (
        <table className="hr-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Departamento</th>
              <th>Puesto</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="5">No hay empleados</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>
                    {emp.first_name} {emp.last_name}
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(emp.employee_id)}
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* =====================
          AÑADIR EMPLEADO
      ===================== */}
      {view === "add" && (
        <div className="add-employee-form">
          <h2>Añadir empleado</h2>

          <form>
            <input placeholder="Nombre" />
            <input placeholder="Apellido" />
            <input placeholder="Email" />
            <input placeholder="Departamento" />
            <input placeholder="Puesto" />

            <div style={{ marginTop: "1rem" }}>
              <button type="submit">💾 Guardar</button>
              <button
                type="button"
                onClick={() => setView("list")}
                style={{ marginLeft: "1rem" }}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HrPage;
