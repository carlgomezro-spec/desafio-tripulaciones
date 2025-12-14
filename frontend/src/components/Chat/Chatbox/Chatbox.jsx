import { useState } from "react";
import MessageBubble from "../MessageBubble/MessageBubble";
import DateRangePicker from "../DateRangePicker/DateRangePicker";
import SummaryCard from "../SummaryCard/SummaryCard";
import DataTable from "../DataTable/DataTable";
import { sendChatMessage } from "../../../services/chatServices";
import "./ChatBox.css";

const ChatBox = () => {
  const role = localStorage.getItem("role");
  if (role !== "mkt" && role !== "hr") return null;

  const [messages, setMessages] = useState([
    { from: "bot", text: "Hola 👋 ¿en qué puedo ayudarte?" }
  ]);
  const [input, setInput] = useState("");

  const [pendingIntent, setPendingIntent] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages(prev => [...prev, { from: "user", text: userMessage }]);
    setInput("");

    try {
      const response = await sendChatMessage(userMessage);
      console.log("CHAT RESPONSE 👉", response);

      // =========================
      // 🧠 INTENT (necesita fechas)
      // =========================
      if (response?.type === "intent" && response.data?.needsDateRange) {
        setPendingIntent(response.data);

        setMessages(prev => [
          ...prev,
          {
            from: "bot",
            text: "📅 Para responder a eso necesito un rango de fechas."
          }
        ]);
        return;
      }

      // =========================
      // 📊 RESPUESTA RICA (FASE 7)
      // =========================
      if (response?.type === "summary" || response?.type === "table") {
        setMessages(prev => [...prev, response]);
        return;
      }

      // =========================
      // 📝 TEXTO SIMPLE
      // =========================
      if (response?.type === "text" && response?.content) {
        setMessages(prev => [
          ...prev,
          { from: "bot", text: response.content }
        ]);
        return;
      }

      // =========================
      // ℹ️ FALLBACK
      // =========================
      setMessages(prev => [
        ...prev,
        {
          from: "bot",
          text: "ℹ️ He recibido la respuesta, pero no pude interpretarla."
        }
      ]);

    } catch (error) {
      setMessages(prev => [
        ...prev,
        { from: "bot", text: "❌ Error al conectar con el servidor" }
      ]);
    }
  };

  return (
    <div className="chatbox">
      <div className="chatbox-messages">
        {messages.map((msg, i) => {

          // 🔹 KPI / SUMMARY
          if (msg.type === "summary") {
            return (
              <SummaryCard
                key={i}
                title={msg.content}
                value={msg.data.total}
              />
            );
          }

          // 🔹 TABLA
          if (msg.type === "table") {
            return (
              <DataTable
                key={i}
                headers={msg.data.headers}
                rows={msg.data.rows}
              />
            );
          }

          // 🔹 MENSAJE DE TEXTO
          return (
            <MessageBubble
              key={i}
              from={msg.from}
              text={msg.text}
            />
          );
        })}
      </div>

      {/* =========================
          📅 DATE RANGE PICKER
         ========================= */}
      {pendingIntent && (
        <DateRangePicker
          onConfirm={async (range) => {
            setMessages(prev => [
              ...prev,
              {
                from: "user",
                text: `📅 Desde ${range.from} hasta ${range.to}`
              }
            ]);

            try {
              const response = await sendChatMessage({
                message: pendingIntent,
                dateRange: range
              });

              console.log("CHAT RESPONSE (DATES) 👉", response);

              if (response?.type === "summary" || response?.type === "table") {
                setMessages(prev => [...prev, response]);
              }
            } catch {
              setMessages(prev => [
                ...prev,
                { from: "bot", text: "❌ Error ejecutando la consulta" }
              ]);
            }

            setPendingIntent(null);
          }}
        />
      )}

      <div className="chatbox-input">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatBox;
