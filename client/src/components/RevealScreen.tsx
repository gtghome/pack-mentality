import { Button } from "@/components/ui/button";
import { ChevronRight, Trophy, Minus } from "lucide-react";
import type { Room, Player } from "../../../shared/schema";
import type { RevealData } from "../pages/GamePage";

function fmtPts(n: number) {
  return n >= 1000 ? (n / 1000).toLocaleString() + "k" : String(n);
}

const CATEGORY_IMAGES: Record<string, string> = {
  "Aussie Life": "/cat-aussie.webp",
  "Know the Group": "/cat-group.webp",
  "Food & Drink": "/cat-food.webp",
  "Pop Culture": "/cat-popculture.webp",
  "Everyday Life": "/cat-everyday.webp",
  "Random": "/cat-random.webp",
};

const CATEGORY_ACCENTS: Record<string, string> = {
  "Aussie Life": "#f59e0b",
  "Know the Group": "#ec4899",
  "Food & Drink": "#ef4444",
  "Pop Culture": "#06b6d4",
  "Everyday Life": "#10b981",
  "Random": "#a855f7",
};

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
  const cat = room.currentCategory || "Random";
  const catImage = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES["Random"];
  const accent = CATEGORY_ACCENTS[cat] || "#7c3aed";

  return (
    <div className="reveal-root">
      {/* Narrow image banner at top */}
      <div className="reveal-img-banner">
        <img src={catImage} alt={cat} className="reveal-img" />
        <div className="reveal-img-overlay" />
        <div className="reveal-img-content">
          <span className="cat-pill" style={{ background: accent }}>{cat}</span>
          <h2 className="reveal-question-text">{room.currentQuestion}</h2>
        </div>
      </div>

      <div className="reveal-body">
        {/* My result */}
        {myScoreChange > 0 ? (
          <div className="my-result my-result-win">
            <span className="result-icon">🎉</span>
            <div>
              <p className="result-title">You're in the herd!</p>
              <p className="result-sub">+{fmtPts(myScoreChange)} points</p>
            </div>
          </div>
        ) : (
          <div className="my-result my-result-lose">
            <span className="result-icon">🐑</span>
            <div>
              <p className="result-title">Black sheep this round!</p>
              <p className="result-sub">Think like the crowd next time</p>
            </div>
          </div>
        )}

        {/* Answer groups */}
        <div className="answer-groups">
          {answerGroups.map((group: any, idx: number) => {
            const isTopGroup = idx === 0 && group.count > 1;
            return (
              <div key={idx} className={`answer-group ${isTopGroup ? "answer-group-winner" : ""}`}>
                <div className="group-answer-row">
                  <div className="group-answer-left">
                    {isTopGroup && <Trophy size={15} className="trophy-icon" />}
                    <span className="group-text">"{group.answer}"</span>
                    <span className="group-count">{group.count} {group.count === 1 ? "person" : "people"}</span>
                  </div>
                  {group.points > 0 && group.count > 1 && (
                    <span className="group-pts-pill" style={{ background: isTopGroup ? accent : "rgba(255,255,255,0.1)" }}>
                      +{fmtPts(group.points)}
                    </span>
                  )}
                </div>
                <div className="group-players">
                  {group.playerIds.map((pid: string) => {
                    const p = getPlayer(pid);
                    if (!p) return null;
                    const pts = scoreChanges[pid] || 0;
                    return (
                      <div key={pid} className={`group-player ${pid === myPlayerId ? "group-player-me" : ""}`}>
                        <span>{p.emoji}</span>
                        <span>{p.name}</span>
                        {pts > 0 && <span className="pts-badge">+{fmtPts(pts)}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scoreboard */}
        <div className="mini-scores">
          <p className="mini-scores-title">Scoreboard</p>
          <div className="score-list">
            {[...scoredPlayers].sort((a, b) => b.score - a.score).map((p, idx) => (
              <div key={p.id} className={`score-row ${p.id === myPlayerId ? "score-row-me" : ""}`}>
                <span className="score-rank">{idx + 1}</span>
                <span className="score-emoji">{p.emoji}</span>
                <span className="score-name">{p.name}</span>
                <span className="score-pts">
                  {scoreChanges[p.id] ? <span className="score-delta">+{fmtPts(scoreChanges[p.id])}</span> : <Minus size={12} style={{ opacity: 0.4 }} />}
                  <strong>{fmtPts(p.score)}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <Button className="btn-primary btn-large" onClick={onNextRound} data-testid="button-next-round">
            {isLastRound ? "See Final Results" : "Next Round"} <ChevronRight size={20} />
          </Button>
        ) : (
          <p className="waiting-host">Waiting for the host to continue…</p>
        )}
      </div>
    </div>
  );
}
