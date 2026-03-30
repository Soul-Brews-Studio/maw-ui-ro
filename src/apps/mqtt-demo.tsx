import { createRoot } from "react-dom/client";
import { useState, useEffect, useRef } from "react";
import "../index.css";
import { connectMqtt, disconnectMqtt } from "../lib/mqtt";
import type { FeedEvent } from "../lib/feed";
import type { PaneStatus } from "../lib/types";

function App() {
  const [connected, setConnected] = useState(false);
  const [feed, setFeed] = useState<(FeedEvent & { _topic?: string })[]>([]);
  const [statuses, setStatuses] = useState<Record<string, PaneStatus>>({});
  const [sessions, setSessions] = useState<any[]>([]);
  const [msgCount, setMsgCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectMqtt(undefined, {
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onFeed: (oracle, event) => {
        setMsgCount(n => n + 1);
        setFeed(prev => [...prev.slice(-99), event]);
      },
      onStatus: (oracle, status) => {
        setMsgCount(n => n + 1);
        setStatuses(prev => ({ ...prev, [oracle]: status as PaneStatus }));
      },
      onSessions: (data) => {
        setMsgCount(n => n + 1);
        setSessions(Array.isArray(data) ? data : []);
      },
    });
    return () => disconnectMqtt();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [feed]);

  const busyCount = Object.values(statuses).filter(s => s === "busy").length;
  const readyCount = Object.values(statuses).filter(s => s === "ready").length;

  return (
    <div className="min-h-screen p-6" style={{ background: "#020208", color: "#e0e0e0" }}>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-black" style={{ color: "#a78bfa" }}>MQTT Demo</h1>
        <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${connected ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
          {connected ? "MQTT LIVE" : "DISCONNECTED"}
        </span>
        <span className="text-xs font-mono text-white/20">
          {msgCount} msgs · {Object.keys(statuses).length} oracles · {busyCount} busy · {readyCount} ready
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Statuses */}
        <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(34,211,238,0.2)" }}>
          <div className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: "#22d3ee" }}>
            Oracle Status (retained)
          </div>
          {Object.entries(statuses).sort().map(([oracle, status]) => (
            <div key={oracle} className="flex items-center gap-2 py-1">
              <span className="w-2 h-2 rounded-full" style={{
                background: status === "busy" ? "#ffa726" : status === "ready" ? "#4caf50" : "#333",
                boxShadow: status === "busy" ? "0 0 6px rgba(255,167,38,0.5)" : undefined,
              }} />
              <span className="text-xs font-mono text-white/70">{oracle}</span>
              <span className="text-[10px] font-mono ml-auto" style={{
                color: status === "busy" ? "#ffa726" : status === "ready" ? "#4caf50" : "#666",
              }}>{status}</span>
            </div>
          ))}
          {Object.keys(statuses).length === 0 && (
            <p className="text-[11px] text-white/15 italic">Waiting for retained status messages...</p>
          )}
        </div>

        {/* Sessions */}
        <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(34,197,94,0.2)" }}>
          <div className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: "#22c55e" }}>
            Sessions (retained)
          </div>
          {sessions.map((s: any) => (
            <div key={s.name} className="mb-2">
              <div className="text-xs font-bold text-emerald-400">{s.name}</div>
              {s.windows?.map((w: any) => (
                <div key={w.index} className="text-[10px] text-white/40 pl-3">{w.name}</div>
              ))}
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-[11px] text-white/15 italic">Waiting for session list...</p>
          )}
        </div>

        {/* Feed */}
        <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(251,191,36,0.2)" }}>
          <div className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: "#fbbf24" }}>
            Live Feed (MQTT)
          </div>
          <div ref={scrollRef} className="max-h-[400px] overflow-y-auto">
            {feed.map((e, i) => (
              <div key={i} className="text-[10px] font-mono py-0.5 border-b flex gap-1.5" style={{ borderColor: "rgba(255,255,255,0.03)" }}>
                <span style={{ color: e.event.startsWith("Pre") ? "#ffa726" : e.event.startsWith("Post") ? "#4caf50" : e.event === "Stop" ? "#ef4444" : "#666" }}>
                  {e.event.slice(0, 12)}
                </span>
                <span className="text-white/50">{e.oracle}</span>
                <span className="text-white/20 truncate">{e.message?.slice(0, 40)}</span>
              </div>
            ))}
            {feed.length === 0 && (
              <p className="text-[11px] text-white/15 italic">Waiting for feed events...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
