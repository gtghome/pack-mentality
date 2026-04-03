import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Crown, Play, UserX } from "lucide-react";
import type { Room, Player } from "../../../shared/schema";

interface Props {
  room: Room;
  players: Player[];
  myPlayerId: string;
  isHost: boolean;
  onStartGame: () => void;
  onKickPlayer: (id: string) => void;
}

export default function LobbyScreen({ room, players, myPlayerId, isHost, onStartGame, onKickPlayer }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/#/${room.id}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      await navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const connected = players.filter(p => p.isConnected);

  return (
    <div className="screen-wrap">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="lobby-card">
        <div className="lobby-header">
          <div className="lobby-code-block">
            <p className="lobby-code-label">Room Code</p>
            <div className="lobby-code-display">{room.id}</div>
            <button className="copy-btn" onClick={copyCode} data-testid="button-copy">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
          <div className="lobby-meta">
            <span>{room.totalRounds} rounds</span>
            <span>{connected.length} / 8 players</span>
          </div>
        </div>

        <div className="players-grid">
          {players.map(p => (
            <div
              key={p.id}
              className={`player-chip ${!p.isConnected ? "player-disconnected" : ""} ${p.id === myPlayerId ? "player-me" : ""}`}
              data-testid={`player-chip-${p.id}`}
            >
              <span className="player-emoji">{p.emoji}</span>
              <span className="player-name">{p.name}</span>
              {room.hostId === p.id && <Crown size={13} className="player-crown" />}
              {p.id === myPlayerId && <span className="player-you">you</span>}
              {isHost && p.id !== myPlayerId && p.isConnected && (
                <button
                  className="kick-btn"
                  onClick={() => onKickPlayer(p.id)}
                  title="Remove player"
                  data-testid={`button-kick-${p.id}`}
                >
                  <UserX size={12} />
                </button>
              )}
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="player-chip player-empty">
              <span className="player-emoji" style={{ opacity: 0.3 }}>?</span>
              <span className="player-name" style={{ opacity: 0.3 }}>Waiting...</span>
            </div>
          ))}
        </div>

        {isHost ? (
          <div className="host-actions">
            {connected.length < 2 && (
              <p className="waiting-hint">Share the room code or link so others can join!</p>
            )}
            <Button
              className="btn-primary btn-large"
              onClick={onStartGame}
              disabled={connected.length < 2}
              data-testid="button-start"
            >
              <Play size={20} /> Start Game
            </Button>
          </div>
        ) : (
          <div className="guest-waiting">
            <div className="spinner" />
            <p>Waiting for the host to start…</p>
          </div>
        )}
      </div>
    </div>
  );
}
