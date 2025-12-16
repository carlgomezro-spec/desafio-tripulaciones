import apiChat from "./api";

// POST /api/query
export const sendChatMessage = async (payload) => {
  try {
    // 🔹 Convertimos cualquier input a formato MCP
    const body = {
      pregunta: typeof payload === "string"
        ? payload
        : payload?.message || payload?.pregunta
    };

    const response = await apiChat.post(
      "/api/query",
      body
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      msg: "Error sending chat message"
    };
  }
};

