import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { Player } from "../../../shared/schema";

interface Props {
  players: Player[];
  myPlayerId: string;
  isHost: boolean;
  onPlayAgain: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_MSGS = [
  "Champion of the herd! 🐄👑",
  "Almost the herd leader!",
  "A solid showing!",
];

export default function FinishedScreen({ players, myPlayerId, isHost, onPlayAgain }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const myPos = sorted.findIndex(p => p.id === myPlayerId);
  const myPlayer = sorted[myPos];
  const amWinner = myPlayer?.id === winner?.id;

  return (
    <div className="screen-wrap">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="finished-card">
        <div className="finished-crown">
          {winner?.emoji}
        </div>
        <h1 className="finished-title">
          {amWinner ? "You won! 🎉" : `${winner?.name} wins!`}
        </h1>
        <p className="finished-sub">
          {amWinner
            ? "You thought exactly like the herd!"
            : `${winner?.name} thought like the herd better than anyone.`}
        </p>

        {/* Podium */}
        <div className="podium">
          {sorted.slice(0, Math.min(3, sorted.length)).map((p, idx) => (
            <div key={p.id} className={`podium-item podium-${idx + 1} ${p.id === myPlayerId ? "podium-me" : ""}`}>
              <div className="podium-emoji">{p.emoji}</div>
              <div className="podium-medal">{MEDALS[idx]}</div>
              <div className="podium-name">{p.name}</div>
              <div className="podium-score">{p.score} pts</div>
            </div>
          ))}
        </div>

        {/* Full leaderboard */}
        {sorted.length > 3 && (
          <div className="full-board">
            {sorted.slice(3).map((p, idx) => (
              <div key={p.id} className={`score-row ${p.id === myPlayerId ? "score-row-me" : ""}`}>
                <span className="score-rank">{idx + 4}</span>
                <span className="score-emoji">{p.emoji}</span>
                <span className="score-name">{p.name}</span>
                <span className="score-pts">{p.score} pts</span>
              </div>
            ))}
          </div>
        )}

        {/* My result if not top 3 */}
        {myPos >= 3 && (
          <p className="my-pos-note">You finished #{myPos + 1} with {myPlayer?.score} points</p>
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
