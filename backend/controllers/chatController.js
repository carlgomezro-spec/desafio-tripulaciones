const { interpretQuestion } = require("../services/openaiService");
const { executeQuery } = require("../services/queryService");

const sendMessage = async (req, res) => {
  try {
    const { message, dateRange } = req.body;
    const { role } = req.user;

    if (role !== "mkt" && role !== "hr") {
      return res.status(403).json({
        type: "text",
        content: "Acceso no permitido"
      });
    }

    if (dateRange) {
      const response = await executeQuery(message, dateRange);
      return res.json(response);
    }

    const intentData = await interpretQuestion(message);

    if (!intentData.needsDateRange) {
      const response = await executeQuery(intentData);
      return res.json(response);
    }

    return res.json({
      type: "intent",
      data: intentData
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "text",
      content: "❌ Error procesando la consulta"
    });
  }
};

module.exports = { sendMessage };
