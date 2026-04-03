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
  const progress = totalPlayers > 0 ? (answeredCount / totalPlayers) * 100 : 0;
  const timerDanger = timeLeft <= 10;
  const timerPct = (timeLeft / ANSWER_TIME) * 100;

  return (
    <div className="screen-wrap">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      <div className="question-card">
        {/* Header bar */}
        <div className="question-header">
          <div className="round-badge">Round {room.currentRound} / {room.totalRounds}</div>
          <div className={`timer ${timerDanger ? "timer-danger" : ""}`}>
            <svg viewBox="0 0 36 36" className="timer-ring">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--c-border)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={timerDanger ? "var(--c-red)" : "var(--c-accent)"}
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

        {/* Category */}
        <div className="category-tag">{room.currentCategory}</div>

        {/* Question */}
        <h2 className="question-text">{room.currentQuestion}</h2>

        {/* Answer form */}
        {!submitted && !hasAnswered ? (
          <form onSubmit={handleSubmit} className="answer-form">
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
              <Button
                type="submit"
                className="send-btn"
                disabled={!answer.trim() || timeLeft === 0}
                data-testid="button-submit-answer"
              >
                <Send size={18} />
              </Button>
            </div>
            <p className="answer-hint">Think like the herd — what will MOST people say?</p>
          </form>
        ) : (
          <div className="submitted-state">
            <div className="submitted-icon"><Check size={28} /></div>
            <p className="submitted-text">Answer locked in!</p>
            <p className="submitted-sub">Waiting for others…</p>
          </div>
        )}

        {/* Players status */}
        <div className="answer-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-label">{answeredCount} / {totalPlayers} answered</p>
          <div className="answer-avatars">
            {players.filter(p => p.isConnected).map(p => (
              <div
                key={p.id}
                className={`avatar-bubble ${answeredPlayerIds.has(p.id) ? "avatar-answered" : "avatar-waiting"}`}
                title={p.name}
                data-testid={`avatar-${p.id}`}
              >
                {p.emoji}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
