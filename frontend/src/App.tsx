import { useState } from "react";
import axios from "axios";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function App() {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg: Message = { role: "user", content: message };
    setChat((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        message: message,
      });

      const aiMsg: Message = {
        role: "ai",
        content: res.data.reply,
      };

      setChat((prev) => [...prev, aiMsg]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { role: "ai", content: "Error: API not working" },
      ]);
    }

    setMessage("");
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>AI Chat</h1>

      <div style={styles.chatBox}>
        {chat.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf:
                msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div>Thinking...</div>}
      </div>

      <div style={styles.inputRow}>
        <input
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMessage(e.target.value)
          }
          placeholder="Type message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: "20px", maxWidth: "600px", margin: "auto" },
  chatBox: {
    border: "1px solid #ddd",
    height: "400px",
    overflowY: "auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  message: {
    background: "#f3f3f3",
    padding: "10px",
    borderRadius: "10px",
    maxWidth: "70%",
  },
  inputRow: { display: "flex", gap: "10px", marginTop: "10px" },
  input: { flex: 1, padding: "10px" },
  button: { padding: "10px" },
};