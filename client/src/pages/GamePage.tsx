import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "wouter";
import LandingScreen from "../components/LandingScreen";
import LobbyScreen from "../components/LobbyScreen";
import QuestionScreen from "../components/QuestionScreen";
import RevealScreen from "../components/RevealScreen";
import ScoreboardScreen from "../components/ScoreboardScreen";
import FinishedScreen from "../components/FinishedScreen";
import KickedScreen from "../components/KickedScreen";
import type { Player, Room } from "../../../shared/schema";

export type GamePhase = "landing" | "lobby" | "answering" | "revealing" | "scores" | "finished" | "kicked";

export interface RevealData {
  answerGroups: { answer: string; playerIds: string[]; count: number; isWinner: boolean }[];
  scoreChanges: Record<string, number>;
  winningAnswer: string;
  winnerCount: number;
  players: Player[];
  round: number;
}

export interface GameState {
  phase: GamePhase;
  room: Room | null;
  players: Player[];
  myPlayerId: string | null;
  myPlayer: Player | null;
  isHost: boolean;
  answeredPlayerIds: Set<string>;
  revealData: RevealData | null;
  hasAnswered: boolean;
}

const WS_URL = typeof window !== "undefined"
  ? (window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws"
  : "";

export default function GamePage() {
  const params = useParams<{ roomCode: string }>();
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    phase: "landing",
    room: null,
    players: [],
    myPlayerId: null,
    myPlayer: null,
    isHost: false,
    answeredPlayerIds: new Set(),
    revealData: null,
    hasAnswered: false,
  });

  const sendMessage = useCallback((msg: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const connectWS = useCallback((onOpen?: () => void) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (onOpen) onOpen();
      // Start ping interval
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
      }, 25000);
    };

    ws.onmessage = (event) => {
      let msg: any;
      try { msg = JSON.parse(event.data); } catch { return; }
      handleMessage(msg);
    };

    ws.onclose = () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };

    return ws;
  }, []);

  const handleMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case "connected":
        break;

      case "room_created":
      case "room_joined":
        setGameState(prev => ({
          ...prev,
          phase: "lobby",
          room: msg.room,
          players: msg.players || [msg.player],
          myPlayerId: msg.playerId,
          myPlayer: msg.player,
          isHost: msg.room.hostId === msg.playerId,
          answeredPlayerIds: new Set(),
          revealData: null,
          hasAnswered: false,
        }));
        break;

      case "player_joined":
        setGameState(prev => ({
          ...prev,
          players: msg.players,
        }));
        break;

      case "player_disconnected":
        setGameState(prev => ({
          ...prev,
          players: msg.players,
        }));
        break;

      case "player_kicked":
        setGameState(prev => ({
          ...prev,
          players: msg.players,
        }));
        break;

      case "round_started":
        setGameState(prev => ({
          ...prev,
          phase: "answering",
          room: prev.room ? {
            ...prev.room,
            status: "answering",
            currentRound: msg.round,
            totalRounds: msg.totalRounds,
            currentQuestion: msg.question,
            currentCategory: msg.category,
            answerDeadline: msg.deadline,
          } : prev.room,
          answeredPlayerIds: new Set(),
          revealData: null,
          hasAnswered: false,
        }));
        break;

      case "player_answered":
        setGameState(prev => {
          const newSet = new Set(prev.answeredPlayerIds);
          newSet.add(msg.playerId);
          const hasAnswered = msg.playerId === prev.myPlayerId ? true : prev.hasAnswered;
          return { ...prev, answeredPlayerIds: newSet, hasAnswered };
        });
        break;

      case "round_revealed":
        setGameState(prev => ({
          ...prev,
          phase: "revealing",
          room: prev.room ? { ...prev.room, status: "revealing" } : prev.room,
          players: msg.players,
          myPlayer: msg.players.find((p: Player) => p.id === prev.myPlayerId) || prev.myPlayer,
          revealData: {
            answerGroups: msg.answerGroups,
            scoreChanges: msg.scoreChanges,
            winningAnswer: msg.winningAnswer,
            winnerCount: msg.winnerCount,
            players: msg.players,
            round: msg.round,
          },
        }));
        break;

      case "game_finished":
        setGameState(prev => ({
          ...prev,
          phase: "finished",
          players: msg.players,
          myPlayer: msg.players.find((p: Player) => p.id === prev.myPlayerId) || prev.myPlayer,
        }));
        break;

      case "game_reset":
        setGameState(prev => ({
          ...prev,
          phase: "lobby",
          room: msg.room,
          players: msg.players,
          myPlayer: msg.players.find((p: Player) => p.id === prev.myPlayerId) || prev.myPlayer,
          answeredPlayerIds: new Set(),
          revealData: null,
          hasAnswered: false,
        }));
        break;

      case "kicked":
        setGameState(prev => ({ ...prev, phase: "kicked" }));
        break;

      case "error":
        // Surface the error to the landing screen
        setGameState(prev => ({ ...prev, lastError: msg.message } as any));
        break;
    }
  }, []);

  // If URL has room code, auto-fill join
  const urlRoomCode = params?.roomCode?.toUpperCase();

  const handleCreateRoom = useCallback((playerName: string, rounds: number) => {
    connectWS(() => {
      sendMessage({ type: "create_room", playerName, totalRounds: rounds });
    });
  }, [connectWS, sendMessage]);

  const handleJoinRoom = useCallback((roomCode: string, playerName: string) => {
    connectWS(() => {
      sendMessage({ type: "join_room", roomCode, playerName });
    });
  }, [connectWS, sendMessage]);

  const handleStartGame = useCallback(() => {
    sendMessage({ type: "start_game" });
  }, [sendMessage]);

  const handleSubmitAnswer = useCallback((answer: string) => {
    sendMessage({ type: "submit_answer", answer });
  }, [sendMessage]);

  const handleNextRound = useCallback(() => {
    sendMessage({ type: "next_round" });
  }, [sendMessage]);

  const handlePlayAgain = useCallback(() => {
    sendMessage({ type: "play_again" });
  }, [sendMessage]);

  const handleKickPlayer = useCallback((playerId: string) => {
    sendMessage({ type: "kick_player", targetPlayerId: playerId });
  }, [sendMessage]);

  // Set up WS on mount
  useEffect(() => {
    connectWS();
    return () => {
      wsRef.current?.close();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, []);

  const { phase, room, players, myPlayerId, myPlayer, isHost, answeredPlayerIds, revealData, hasAnswered } = gameState;
  const lastError = (gameState as any).lastError as string | undefined;

  if (phase === "kicked") return <KickedScreen />;

  if (phase === "landing") {
    return (
      <LandingScreen
        initialRoomCode={urlRoomCode}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        error={lastError}
        onClearError={() => setGameState(prev => ({ ...prev, lastError: undefined } as any))}
      />
    );
  }

  if (phase === "lobby" && room) {
    return (
      <LobbyScreen
        room={room}
        players={players}
        myPlayerId={myPlayerId!}
        isHost={isHost}
        onStartGame={handleStartGame}
        onKickPlayer={handleKickPlayer}
      />
    );
  }

  if (phase === "answering" && room) {
    return (
      <QuestionScreen
        room={room}
        players={players}
        myPlayerId={myPlayerId!}
        answeredPlayerIds={answeredPlayerIds}
        hasAnswered={hasAnswered}
        onSubmitAnswer={handleSubmitAnswer}
      />
    );
  }

  if (phase === "revealing" && revealData) {
    return (
      <RevealScreen
        revealData={revealData}
        players={players}
        myPlayerId={myPlayerId!}
        isHost={isHost}
        room={room!}
        onNextRound={handleNextRound}
      />
    );
  }

  if (phase === "finished") {
    return (
      <FinishedScreen
        players={players}
        myPlayerId={myPlayerId!}
        isHost={isHost}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return null;
}
