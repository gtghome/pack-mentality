import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, LogIn, ChevronRight } from "lucide-react";

interface Props {
  initialRoomCode?: string;
  onCreateRoom: (name: string, rounds: number) => void;
  onJoinRoom: (code: string, name: string) => void;
  error?: string;
  onClearError: () => void;
}

export default function LandingScreen({ initialRoomCode, onCreateRoom, onJoinRoom, error, onClearError }: Props) {
  const [tab, setTab] = useState<"join" | "create">(initialRoomCode ? "join" : "join");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState(initialRoomCode || "");
  const [rounds, setRounds] = useState(8);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
      setTab("join");
    }
  }, [initialRoomCode]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(onClearError, 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    onCreateRoom(playerName.trim(), rounds);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;
    onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div className="landing-wrap">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="landing-card">
        {/* Logo */}
        <div className="logo-wrap">
          <svg viewBox="0 0 48 48" width="56" height="56" aria-label="Herd Mentality logo" fill="none">
            <circle cx="24" cy="24" r="22" fill="var(--c-accent)" />
            <text x="24" y="32" textAnchor="middle" fontSize="26" fill="white">🐄</text>
          </svg>
          <div>
            <h1 className="logo-title">Pack Mentality</h1>
            <p className="logo-sub">Think like the herd. Win together.</p>
          </div>
        </div>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        {/* Tab switcher */}
        <div className="tab-row">
          <button
            className={`tab-btn ${tab === "join" ? "tab-active" : ""}`}
            onClick={() => setTab("join")}
            data-testid="tab-join"
          >
            <LogIn size={16} /> Join Game
          </button>
          <button
            className={`tab-btn ${tab === "create" ? "tab-active" : ""}`}
            onClick={() => setTab("create")}
            data-testid="tab-create"
          >
            <Plus size={16} /> Create Game
          </button>
        </div>

        {tab === "join" && (
          <form onSubmit={handleJoin} className="form-stack">
            <div className="field">
              <label htmlFor="join-name">Your name</label>
              <Input
                id="join-name"
                placeholder="e.g. Sarah"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={20}
                data-testid="input-player-name"
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="join-code">Room code</label>
              <Input
                id="join-code"
                placeholder="e.g. ABCD"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="code-input"
                data-testid="input-room-code"
              />
            </div>
            <Button type="submit" className="btn-primary" data-testid="button-join" disabled={!playerName.trim() || !roomCode.trim()}>
              Join Game <ChevronRight size={18} />
            </Button>
          </form>
        )}

        {tab === "create" && (
          <form onSubmit={handleCreate} className="form-stack">
            <div className="field">
              <label htmlFor="create-name">Your name</label>
              <Input
                id="create-name"
                placeholder="e.g. James"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={20}
                data-testid="input-host-name"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Number of rounds</label>
              <div className="rounds-row">
                {[5, 8, 10, 12].map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`round-chip ${rounds === r ? "round-chip-active" : ""}`}
                    onClick={() => setRounds(r)}
                    data-testid={`button-rounds-${r}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="btn-primary" data-testid="button-create" disabled={!playerName.trim()}>
              Create Room <ChevronRight size={18} />
            </Button>
          </form>
        )}

        <div className="how-it-works">
          <div className="hiw-item"><span>🎯</span><span>Everyone answers the same question</span></div>
          <div className="hiw-item"><span>🐄</span><span>Match the herd to score points</span></div>
          <div className="hiw-item"><span>🏆</span><span>Most points at the end wins!</span></div>
        </div>
      </div>
    </div>
  );
}
