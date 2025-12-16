const axios = require("axios");

const LLM_URL = process.env.LLM_URL || "http://localhost:3001/api/query";

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { role, id } = req.user;

    // Control de acceso (esto lo mantienes)
    if (role !== "mkt" && role !== "hr") {
      return res.status(403).json({
        exito: false,
        tipo: "texto",
        mensaje: "Acceso no permitido"
      });
    }

    if (!message) {
      return res.status(400).json({
        exito: false,
        tipo: "texto",
        mensaje: "Mensaje vacío"
      });
    }

    // Llamada al backend LLM
    const llmResponse = await axios.post(LLM_URL, {
      pregunta: message,
      usuario_id: id,
      rol: role
    });

    // Se devuelve TAL CUAL
    return res.json(llmResponse.data);

  } catch (error) {
    console.error("Error chatController:", error.message);

    return res.status(500).json({
      exito: false,
      tipo: "texto",
      mensaje: "❌ Error procesando la consulta"
    });
  }
};

module.exports = { sendMessage };
