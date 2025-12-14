import api from "./api";

// POST /api/chat/message
export const sendChatMessage = async (payload) => {
  try {
    // 🔹 Si viene un string → lo convertimos
    const body =
      typeof payload === "string"
        ? { message: payload }
        : payload;

    const response = await api.post(
      "chat/message",
      body
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || {
      msg: "Error sending chat message"
    };
  }
};
