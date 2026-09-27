"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, TrendingDown, TriangleAlert, Zap, Building } from "lucide-react";
import { api, type ChatMessage } from "@/lib/api";

const SUGGESTIONS = [
  { label: "Top savings right now", icon: TrendingDown },
  { label: "Any critical alerts?", icon: TriangleAlert },
  { label: "This month's cost", icon: Zap },
  { label: "Building overview", icon: Building },
];

const GREETING =
  "Hi! I'm ARIA, your EnergyIQ AI assistant. I have live access to all your building data — ask me anything about consumption, costs, alerts, or optimization opportunities.";

export default function AriaAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.askAssistant(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't reach the backend just now — please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-6 flex flex-col z-30"
          style={{
            width: 360,
            maxHeight: 520,
            borderRadius: 20,
            background: "var(--bg-sidebar-solid)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card-hover)",
            overflow: "hidden",
          }}
        >
          <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}
            >
              <Sparkles size={15} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 640, color: "var(--text-primary)" }}>ARIA</p>
              <p className="flex items-center gap-1" style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#34D399" }} /> Online · EnergyIQ AI
              </p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ minHeight: 240, maxHeight: 340 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className="px-3 py-2"
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  borderRadius: 14,
                  borderBottomRightRadius: m.role === "user" ? 4 : 14,
                  borderBottomLeftRadius: m.role === "assistant" ? 4 : 14,
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.role === "user" ? "var(--text-primary)" : "var(--bg-card)",
                  color: m.role === "user" ? "var(--bg-page)" : "var(--text-secondary)",
                  border: m.role === "assistant" ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="px-3 py-2 self-start" style={{ fontSize: 12.5, color: "var(--text-muted)", borderRadius: 14, background: "var(--bg-card)" }}>
                thinking...
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => send(s.label)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px]"
                  style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
                >
                  <s.icon size={12} /> {s.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 flex items-center gap-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask ARIA anything..."
              className="flex-1 outline-none"
              style={{ fontSize: 12.5, padding: "8px 10px", borderRadius: 9, background: "var(--bg-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading}
              className="flex items-center justify-center shrink-0"
              style={{ width: 34, height: 34, borderRadius: 9, background: "var(--text-primary)", color: "var(--bg-page)", opacity: loading ? 0.5 : 1 }}
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-center pb-2" style={{ fontSize: 9.5, color: "var(--text-muted)" }}>
            ARIA · EnergyIQ AI · Answers grounded in live backend data
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 flex items-center justify-center z-30"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
          boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
        }}
      >
        {open ? <X size={22} color="white" /> : <Sparkles size={22} color="white" />}
      </button>
    </>
  );
}
