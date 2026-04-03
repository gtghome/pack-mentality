import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { Player } from "../../../shared/schema";

function fmtPts(n: number) {
  return n >= 1000 ? (n / 1000).toLocaleString() + "k" : String(n);
}

interface Props {
  players: Player[];
  myPlayerId: string;
  isHost: boolean;
  onPlayAgain: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function FinishedScreen({ players, myPlayerId, isHost, onPlayAgain }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const myPos = sorted.findIndex(p => p.id === myPlayerId);
  const myPlayer = sorted[myPos];
  const amWinner = myPlayer?.id === winner?.id;

  return (
    <div className="finished-root">
      {/* Hero image background */}
      <div className="finished-hero-img">
        <img src="/hero.webp" alt="Pack Mentality" className="hero-img" />
        <div className="finished-hero-overlay" />
      </div>

      <div className="finished-body">
        <div className="finished-winner-block">
          <div className="finished-crown">{winner?.emoji}</div>
          <h1 className="finished-title">{amWinner ? "You won! 🎉" : `${winner?.name} wins!`}</h1>
          <p className="finished-sub">
            {amWinner ? "You thought exactly like the herd!" : `${winner?.name} with ${fmtPts(winner?.score ?? 0)} points`}
          </p>
        </div>

        {/* Podium top 3 */}
        <div className="podium">
          {sorted.slice(0, Math.min(3, sorted.length)).map((p, idx) => (
            <div key={p.id} className={`podium-item podium-${idx + 1} ${p.id === myPlayerId ? "podium-me" : ""}`}>
              <div className="podium-emoji">{p.emoji}</div>
              <div className="podium-medal">{MEDALS[idx]}</div>
              <div className="podium-name">{p.name}</div>
              <div className="podium-score">{fmtPts(p.score)}</div>
            </div>
          ))}
        </div>

        {/* Rest of leaderboard */}
        {sorted.length > 3 && (
          <div className="full-board">
            {sorted.slice(3).map((p, idx) => (
              <div key={p.id} className={`score-row ${p.id === myPlayerId ? "score-row-me" : ""}`}>
                <span className="score-rank">{idx + 4}</span>
                <span className="score-emoji">{p.emoji}</span>
                <span className="score-name">{p.name}</span>
                <span className="score-pts"><strong>{fmtPts(p.score)}</strong></span>
              </div>
            ))}
          </div>
        )}

        {isHost ? (
          <Button className="btn-primary btn-large" onClick={onPlayAgain} data-testid="button-play-again">
            <RefreshCw size={18} /> Play Again
          </Button>
        ) : (
          <p className="waiting-host">Waiting for the host to start a new game…</p>
        )}
      </div>
    </div>
  );
}
