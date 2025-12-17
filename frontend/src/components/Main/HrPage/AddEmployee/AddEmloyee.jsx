import { useState } from "react";
import { createEmployee } from "../../../../services/hrservice";
import "./AddEmployee.css";
import Swal from "sweetalert2";

const AddEmployee = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    position: "",
    salary: ""
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =====================
     HANDLE CHANGE
  ===================== */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* =====================
     VALIDATION
  ===================== */
  const validate = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      return "Nombre, apellido y email son obligatorios";
    }

    if (!formData.email.includes("@")) {
      return "Email no válido";
    }

    if (formData.salary && Number(formData.salary) <= 0) {
      return "El salario debe ser mayor que 0";
    }

    return null;
  };

  /* =====================
     SUBMIT
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      Swal.fire({
        title: "Error de validación",
        text: validationError,
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f59e0b",
        background: "#1f2937",
        color: "#f9fafb",
        width: "90%",
        maxWidth: "400px",
      });
      return;
    }

    const payload = {
      ...formData,
      salary: formData.salary ? Number(formData.salary) : null
    };

    console.log("Enviando al backend:", payload);

    try {
      setLoading(true);
      setError(null);
      await createEmployee(payload);
     Swal.fire({
        title: "Empleado creado",
        text: "El empleado se ha creado correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#10b981",
        background: "#1f2937",
        color: "#f9fafb",
        width: "90%",
        maxWidth: "400px",
      }).then(() => {
        onSuccess(); // vuelve al listado + refresca
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Error al crear el empleado",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#ef4444",
        background: "#1f2937",
        color: "#f9fafb",
        width: "90%",
        maxWidth: "400px",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-employee-form">
      <h2>Añadir empleado</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="first_name"
          placeholder="Nombre"
          value={formData.first_name}
          onChange={handleChange}
        />

        <input
          name="last_name"
          placeholder="Apellido"
          value={formData.last_name}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          name="department"
          placeholder="Departamento"
          value={formData.department}
          onChange={handleChange}
        />

        <input
          name="position"
          placeholder="Puesto"
          value={formData.position}
          onChange={handleChange}
        />

        <input
          type="number"
          name="salary"
          placeholder="Salario"
          value={formData.salary}
          onChange={handleChange}
        />

        <div style={{ marginTop: "1rem" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            style={{ marginLeft: "1rem" }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
