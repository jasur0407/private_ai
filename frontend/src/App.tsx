import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css"

let idCounter = 0;

type Message = {
  id: number;
  role: "user" | "ai";
  content: string;
  displayed: string;
  done: boolean;
};

const TYPING_SPEED_MS = 10;

export default function App() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const pendingMsg = chat.find((m) => m.role === "ai" && !m.done);
    if (!pendingMsg) return;
    if (typingRef.current) clearInterval(typingRef.current);

    let i = pendingMsg.displayed.length;
    const full = pendingMsg.content;

    typingRef.current = setInterval(() => {
      i = Math.min(i + 3, full.length);
      setChat((prev) =>
        prev.map((m) =>
          m.id === pendingMsg.id
            ? { ...m, displayed: full.slice(0, i), done: i >= full.length }
            : m
        )
      );
      if (i >= full.length && typingRef.current) {
        clearInterval(typingRef.current);
        typingRef.current = null;
      }
    }, TYPING_SPEED_MS);

    return () => { if (typingRef.current) clearInterval(typingRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.length]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setChat((prev) => [...prev, {
      id: idCounter++, role: "user",
      content: trimmed, displayed: trimmed, done: true,
    }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/chat", { message: trimmed });
      const reply: string = res.data.reply ?? "No response received.";
      setChat((prev) => [...prev, {
        id: idCounter++, role: "ai",
        content: reply, displayed: "", done: false,
      }]);
    } catch (err: unknown) {
      let errorText = "Something went wrong. Is the server running?";
      if (axios.isAxiosError(err)) {
        const d = err.response?.data?.detail;
        if (d) errorText = d;
        else if (err.response?.status === 503) errorText = "Server error: API key may be missing.";
      }
      setChat((prev) => [...prev, {
        id: idCounter++, role: "ai",
        content: errorText, displayed: errorText, done: true,
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }, [input, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>

      <div className="app">
        <header className="header">
          <span className="header-title">Chat Application</span>
        </header>

        <div className="chat-area">
          {chat.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">☕</div>
              <div className="empty-title">Good to see you</div>
              <div className="empty-sub">Ask me anything</div>
            </div>
          ) : (
            <div className="messages-inner">
              {chat.map((msg) => (
                <div key={msg.id} className={`msg-row ${msg.role}`}>
                  {msg.role === "ai" && <div className="ai-avatar">✦</div>}
                  <div className={`msg-bubble ${msg.role}`}>
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <>
                        <ReactMarkdown>{msg.displayed}</ReactMarkdown>
                        {!msg.done && <span className="cursor" />}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="msg-row ai">
                  <div className="ai-avatar">✦</div>
                  <div className="msg-bubble ai">
                    <div className="typing-dots"><span /><span /><span /></div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="input-area">
          <div className="input-inner">
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              disabled={loading}
              autoFocus
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </>
  );
}