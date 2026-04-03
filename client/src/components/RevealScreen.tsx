import { Button } from "@/components/ui/button";
import { ChevronRight, Trophy, Minus } from "lucide-react";
import type { Room, Player } from "../../../shared/schema";
import type { RevealData } from "../pages/GamePage";

interface Props {
  revealData: RevealData;
  players: Player[];
  myPlayerId: string;
  isHost: boolean;
  room: Room;
  onNextRound: () => void;
}

export default function RevealScreen({ revealData, players, myPlayerId, isHost, room, onNextRound }: Props) {
  const { answerGroups, scoreChanges, players: scoredPlayers, round } = revealData;

  const getPlayer = (id: string) => scoredPlayers.find(p => p.id === id);
  const myScoreChange = scoreChanges[myPlayerId] || 0;
  const isLastRound = round >= room.totalRounds;

  const winnerGroup = answerGroups[0];
  const isWinner = winnerGroup && winnerGroup.playerIds.includes(myPlayerId);

  return (
    <div className="screen-wrap">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="reveal-card">
        {/* Header */}
        <div className="reveal-header">
          <div className="round-badge">Round {round} / {room.totalRounds} — Results</div>
          <h2 className="reveal-question">{room.currentQuestion}</h2>
        </div>

        {/* My result banner */}
        {myScoreChange > 0 ? (
          <div className="my-result my-result-win">
            <span className="result-icon">🎉</span>
            <div>
              <p className="result-title">You're in the herd!</p>
              <p className="result-sub">+{myScoreChange} points</p>
            </div>
          </div>
        ) : (
          <div className="my-result my-result-lose">
            <span className="result-icon">🐑</span>
            <div>
              <p className="result-title">Black sheep!</p>
              <p className="result-sub">Try to think like the crowd next time</p>
            </div>
          </div>
        )}

        {/* Answer groups */}
        <div className="answer-groups">
          {answerGroups.map((group, idx) => {
            const isTopGroup = idx === 0 && group.count > 1;
            return (
              <div key={idx} className={`answer-group ${isTopGroup ? "answer-group-winner" : ""}`}>
                <div className="group-answer">
                  {isTopGroup && <Trophy size={16} className="trophy-icon" />}
                  <span className="group-text">"{group.answer}"</span>
                  <span className="group-count">{group.count} {group.count === 1 ? "person" : "people"}</span>
                </div>
                <div className="group-players">
                  {group.playerIds.map(pid => {
                    const p = getPlayer(pid);
                    if (!p) return null;
                    const pts = scoreChanges[pid] || 0;
                    return (
                      <div key={pid} className={`group-player ${pid === myPlayerId ? "group-player-me" : ""}`}>
                        <span>{p.emoji}</span>
                        <span>{p.name}</span>
                        {pts > 0 && <span className="pts-badge">+{pts}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scoreboard mini */}
        <div className="mini-scores">
          <p className="mini-scores-title">Scoreboard</p>
          <div className="score-list">
            {[...scoredPlayers].sort((a, b) => b.score - a.score).map((p, idx) => (
              <div key={p.id} className={`score-row ${p.id === myPlayerId ? "score-row-me" : ""}`}>
                <span className="score-rank">{idx + 1}</span>
                <span className="score-emoji">{p.emoji}</span>
                <span className="score-name">{p.name}</span>
                <span className="score-pts">
                  {scoreChanges[p.id] ? <span className="score-delta">+{scoreChanges[p.id]}</span> : <Minus size={12} opacity={0.4} />}
                  {p.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <Button className="btn-primary btn-large" onClick={onNextRound} data-testid="button-next-round">
            {isLastRound ? "See Final Results" : "Next Round"} <ChevronRight size={20} />
          </Button>
        )}
        {!isHost && (
          <p className="waiting-host">Waiting for the host to continue…</p>
        )}
      </div>
    </div>
  );
}
