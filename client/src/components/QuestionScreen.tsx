import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check } from "lucide-react";
import type { Room, Player } from "../../../shared/schema";

interface Props {
  room: Room;
  players: Player[];
  myPlayerId: string;
  answeredPlayerIds: Set<string>;
  hasAnswered: boolean;
  onSubmitAnswer: (answer: string) => void;
}

const ANSWER_TIME = 45;

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

export default function QuestionScreen({ room, players, myPlayerId, answeredPlayerIds, hasAnswered, onSubmitAnswer }: Props) {
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIME);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSubmitted(false);
    setAnswer("");
    if (inputRef.current) inputRef.current.focus();
  }, [room.currentRound]);

  useEffect(() => {
    if (!room.answerDeadline) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((room.answerDeadline! - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [room.answerDeadline]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || submitted || hasAnswered) return;
    setSubmitted(true);
    onSubmitAnswer(answer.trim());
  };

  const answeredCount = answeredPlayerIds.size;
  const totalPlayers = players.filter(p => p.isConnected).length;
  const timerDanger = timeLeft <= 10;
  const timerPct = (timeLeft / ANSWER_TIME) * 100;
  const cat = room.currentCategory || "Random";
  const catImage = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES["Random"];
  const accent = CATEGORY_ACCENTS[cat] || "#7c3aed";

  return (
    <div className="qscreen-root">
      {/* Full-bleed category image */}
      <div className="qscreen-img-wrap">
        <img src={catImage} alt={cat} className="qscreen-img" />
        <div className="qscreen-img-overlay" />
      </div>

      {/* Top HUD */}
      <div className="qscreen-hud">
        <div className="round-badge">Round {room.currentRound} / {room.totalRounds}</div>
        <div className={`timer ${timerDanger ? "timer-danger" : ""}`}>
          <svg viewBox="0 0 36 36" className="timer-ring">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke={timerDanger ? "#ef4444" : accent}
              strokeWidth="3"
              strokeDasharray="100"
              strokeDashoffset={100 - timerPct}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.25s linear, stroke 0.3s" }}
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span className="timer-num">{timeLeft}</span>
        </div>
      </div>

      {/* Category pill over image */}
      <div className="qscreen-cat-row">
        <span className="cat-pill" style={{ background: accent }}>{cat}</span>
      </div>

      {/* Question text over image */}
      <div className="qscreen-question-wrap">
        <h2 className="qscreen-question">{room.currentQuestion}</h2>
      </div>

      {/* Bottom panel */}
      <div className="qscreen-bottom">
        {!submitted && !hasAnswered ? (
          <form onSubmit={handleSubmit} className="answer-form">
            <p className="answer-hint">Think like the herd — what will MOST people say?</p>
            <div className="answer-input-wrap">
              <Input
                ref={inputRef}
                placeholder="Type your answer…"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                maxLength={80}
                className="answer-input"
                data-testid="input-answer"
                disabled={timeLeft === 0}
                autoComplete="off"
              />
              <Button type="submit" className="send-btn" disabled={!answer.trim() || timeLeft === 0} data-testid="button-submit-answer">
                <Send size={18} />
              </Button>
            </div>
          </form>
        ) : (
          <div className="submitted-state">
            <div className="submitted-icon"><Check size={26} /></div>
            <div>
              <p className="submitted-text">Locked in!</p>
              <p className="submitted-sub">Waiting for the herd…</p>
            </div>
          </div>
        )}

        {/* Player avatars */}
        <div className="answer-avatars-row">
          {players.filter(p => p.isConnected).map(p => (
            <div key={p.id} className={`avatar-bubble ${answeredPlayerIds.has(p.id) ? "avatar-answered" : "avatar-waiting"}`} title={p.name} data-testid={`avatar-${p.id}`}>
              {p.emoji}
              {answeredPlayerIds.has(p.id) && <span className="avatar-tick">✓</span>}
            </div>
          ))}
          <span className="answered-label">{answeredCount}/{totalPlayers} answered</span>
        </div>
      </div>
    </div>
  );
}
