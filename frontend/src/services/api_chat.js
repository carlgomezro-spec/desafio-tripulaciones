import axios from "axios";

const apiChat = axios.create({
  baseURL: "http://localhost:3001"
});

export default apiChat;
