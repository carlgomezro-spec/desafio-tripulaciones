import { useEffect, useState } from "react";
import { getAllEmployees,deleteEmployeeById} from "../../../services/hrservice.js";
import AddEmployee from "./AddEmployee/AddEmloyee.jsx";
import "./HrPage.css";

const HrPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("list"); // list | add

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

  const handleDelete = async (employee_id) => {
    if (!window.confirm("¿Eliminar empleado?")) return;

    try {
      await deleteEmployeeById(employee_id);
      fetchEmployees();
    } catch {
      alert("Error deleting employee");
    }
  };

  if (loading) return <p>Cargando empleados...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="page-container">
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
                  <td>{emp.first_name} {emp.last_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td>
                    <button onClick={() => handleDelete(emp.employee_id)}>
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {view === "add" && (
        <AddEmployee
          onSuccess={() => {
            fetchEmployees();
            setView("list");
          }}
          onCancel={() => setView("list")}
        />
      )}
    </div>
  );
};

export default HrPage;
