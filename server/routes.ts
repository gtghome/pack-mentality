import type { Express } from "express";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import { pickQuestions } from "../shared/questions";
import type { Room, Player } from "../shared/schema";

const ANSWER_TIME_SECONDS = 45;
const EMOJIS = ["🐄", "🐸", "🦊", "🐼", "🦁", "🐨", "🦋", "🐙", "🦄", "🐧", "🦀", "🐺"];

// Map of roomId -> list of websocket clients with playerId
interface GameClient {
  ws: WebSocket;
  playerId: string;
  roomId: string;
}

const clients = new Map<string, GameClient>(); // clientId -> GameClient
const roomQuestions = new Map<string, Array<{ question: string; category: string }>>(); // roomId -> questions
const answerTimers = new Map<string, ReturnType<typeof setTimeout>>(); // roomId -> timer

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function broadcastToRoom(roomId: string, message: object) {
  const data = JSON.stringify(message);
  for (const [, client] of clients) {
    if (client.roomId === roomId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  }
}

function getGameState(roomId: string) {
  const room = storage.getRoom(roomId);
  if (!room) return null;
  const players = storage.getRoomPlayers(roomId);
  return { room, players };
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");
}

function scoreRound(roomId: string, round: number) {
  const room = storage.getRoom(roomId);
  if (!room) return;

  const players = storage.getRoomPlayers(roomId);
  const allAnswers = storage.getRoundAnswers(roomId, round);

  // Group answers by normalized text
  const answerGroups: Record<string, string[]> = {}; // normalized -> playerIds
  for (const ans of allAnswers) {
    const normalized = normalizeAnswer(ans.answer);
    if (!answerGroups[normalized]) answerGroups[normalized] = [];
    answerGroups[normalized].push(ans.playerId);
  }

  // Sort groups from most common to least common
  const sortedGroups = Object.entries(answerGroups)
    .sort((a, b) => b[1].length - a[1].length);

  const maxCount = sortedGroups[0]?.[1].length ?? 0;
  const winningNormalized = sortedGroups[0]?.[0] ?? "";

  // Points: 100,000 for the top group, scale down 10,000 per rank
  // Solo answers (group of 1) only score if ALL players answered uniquely
  const allUnique = sortedGroups.every(([, pids]) => pids.length === 1);

  const scoreChanges: Record<string, number> = {};

  sortedGroups.forEach(([normalized, pids], rank) => {
    const points = Math.max(0, 100000 - rank * 10000);
    // Award points if group has 2+ people, OR everyone answered uniquely (no one matched)
    const shouldScore = pids.length > 1 || allUnique;
    if (shouldScore && points > 0) {
      for (const pid of pids) {
        const player = storage.getPlayer(pid);
        if (player) {
          storage.updatePlayer(pid, { score: player.score + points });
          scoreChanges[pid] = points;
        }
      }
    }
  });

  // Build reveal data
  const revealData = {
    answerGroups: sortedGroups.map(([normalized, pids], rank) => ({
      answer: allAnswers.find(a => normalizeAnswer(a.answer) === normalized)?.answer || normalized,
      playerIds: pids,
      count: pids.length,
      isWinner: rank === 0 && pids.length > 1,
      points: Math.max(0, 100000 - rank * 10000),
    })),
    scoreChanges,
    winningAnswer: allAnswers.find(a => normalizeAnswer(a.answer) === winningNormalized)?.answer || winningNormalized,
    winnerCount: maxCount,
  };

  return revealData;
}

function startNextRound(roomId: string) {
  const room = storage.getRoom(roomId);
  if (!room) return;

  const nextRound = room.currentRound + 1;
  const questions = roomQuestions.get(roomId) || [];

  if (nextRound > room.totalRounds || nextRound > questions.length) {
    // Game over
    const players = storage.getRoomPlayers(roomId);
    const sorted = [...players].sort((a, b) => b.score - a.score);
    storage.updateRoom(roomId, { status: "finished" });
    broadcastToRoom(roomId, {
      type: "game_finished",
      players: sorted,
    });
    return;
  }

  const q = questions[nextRound - 1];
  const deadline = Date.now() + ANSWER_TIME_SECONDS * 1000;

  storage.updateRoom(roomId, {
    status: "answering",
    currentRound: nextRound,
    currentQuestion: q.question,
    currentCategory: q.category,
    answerDeadline: deadline,
  });

  broadcastToRoom(roomId, {
    type: "round_started",
    round: nextRound,
    totalRounds: room.totalRounds,
    question: q.question,
    category: q.category,
    deadline,
  });

  // Auto-reveal when timer runs out
  const timer = setTimeout(() => {
    revealRound(roomId, nextRound);
  }, ANSWER_TIME_SECONDS * 1000 + 500);
  answerTimers.set(roomId, timer);
}

function revealRound(roomId: string, round: number) {
  // Clear any existing timer
  const existing = answerTimers.get(roomId);
  if (existing) {
    clearTimeout(existing);
    answerTimers.delete(roomId);
  }

  const room = storage.getRoom(roomId);
  if (!room || room.status !== "answering") return;

  storage.updateRoom(roomId, { status: "revealing" });

  const revealData = scoreRound(roomId, round);
  const updatedPlayers = storage.getRoomPlayers(roomId);

  broadcastToRoom(roomId, {
    type: "round_revealed",
    round,
    ...revealData,
    players: updatedPlayers,
  });
}

export function registerRoutes(httpServer: Server, app: Express) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    const clientId = uuidv4();

    ws.on("message", (raw) => {
      let msg: any;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      switch (msg.type) {
        case "create_room": {
          const { playerName, totalRounds = 8 } = msg;
          let code = generateRoomCode();
          // ensure unique code
          while (storage.getRoom(code)) code = generateRoomCode();

          const playerId = uuidv4();
          const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

          const room = storage.createRoom({
            id: code,
            hostId: playerId,
            status: "lobby",
            currentRound: 0,
            totalRounds,
            currentQuestion: null,
            currentCategory: null,
            answerDeadline: null,
            createdAt: Date.now(),
          });

          const player = storage.createPlayer({
            id: playerId,
            roomId: code,
            name: playerName,
            emoji,
            score: 0,
            isConnected: 1,
            joinedAt: Date.now(),
          });

          // Pick questions upfront
          const questions = pickQuestions(totalRounds);
          roomQuestions.set(code, questions);

          clients.set(clientId, { ws, playerId, roomId: code });

          ws.send(JSON.stringify({
            type: "room_created",
            roomId: code,
            playerId,
            player,
            room,
          }));
          break;
        }

        case "join_room": {
          const { roomCode, playerName } = msg;
          const room = storage.getRoom(roomCode.toUpperCase());

          if (!room) {
            ws.send(JSON.stringify({ type: "error", message: "Room not found. Check the code and try again." }));
            return;
          }
          if (room.status === "finished") {
            ws.send(JSON.stringify({ type: "error", message: "This game has already ended." }));
            return;
          }

          const playerId = uuidv4();
          const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

          const player = storage.createPlayer({
            id: playerId,
            roomId: roomCode.toUpperCase(),
            name: playerName,
            emoji,
            score: 0,
            isConnected: 1,
            joinedAt: Date.now(),
          });

          clients.set(clientId, { ws, playerId, roomId: roomCode.toUpperCase() });

          const players = storage.getRoomPlayers(roomCode.toUpperCase());

          ws.send(JSON.stringify({
            type: "room_joined",
            roomId: roomCode.toUpperCase(),
            playerId,
            player,
            room,
            players,
          }));

          // Notify everyone else
          broadcastToRoom(roomCode.toUpperCase(), {
            type: "player_joined",
            player,
            players,
          });
          break;
        }

        case "start_game": {
          const client = clients.get(clientId);
          if (!client) return;
          const room = storage.getRoom(client.roomId);
          if (!room || room.hostId !== client.playerId) {
            ws.send(JSON.stringify({ type: "error", message: "Only the host can start the game." }));
            return;
          }
          const players = storage.getRoomPlayers(client.roomId);
          if (players.length < 2) {
            ws.send(JSON.stringify({ type: "error", message: "Need at least 2 players to start." }));
            return;
          }

          startNextRound(client.roomId);
          break;
        }

        case "submit_answer": {
          const client = clients.get(clientId);
          if (!client) return;
          const room = storage.getRoom(client.roomId);
          if (!room || room.status !== "answering") return;

          const { answer } = msg;
          if (!answer || typeof answer !== "string" || answer.trim().length === 0) return;

          // Check if already answered
          const existing = storage.getAnswer(client.roomId, client.playerId, room.currentRound);
          if (existing) return;

          storage.createAnswer({
            id: uuidv4(),
            roomId: client.roomId,
            playerId: client.playerId,
            round: room.currentRound,
            answer: answer.trim().slice(0, 100),
            submittedAt: Date.now(),
          });

          // Notify all players that this player answered (not revealing what)
          broadcastToRoom(client.roomId, {
            type: "player_answered",
            playerId: client.playerId,
          });

          // Check if all connected players have answered
          const allPlayers = storage.getRoomPlayers(client.roomId).filter(p => p.isConnected);
          const roundAnswers = storage.getRoundAnswers(client.roomId, room.currentRound);
          if (roundAnswers.length >= allPlayers.length) {
            // All answered — reveal early
            revealRound(client.roomId, room.currentRound);
          }
          break;
        }

        case "next_round": {
          const client = clients.get(clientId);
          if (!client) return;
          const room = storage.getRoom(client.roomId);
          if (!room || room.hostId !== client.playerId) return;
          if (room.status !== "revealing") return;

          startNextRound(client.roomId);
          break;
        }

        case "kick_player": {
          const client = clients.get(clientId);
          if (!client) return;
          const room = storage.getRoom(client.roomId);
          if (!room || room.hostId !== client.playerId) return;

          const { targetPlayerId } = msg;
          if (targetPlayerId === client.playerId) return; // can't kick yourself

          storage.removePlayer(targetPlayerId);
          const players = storage.getRoomPlayers(client.roomId);
          broadcastToRoom(client.roomId, { type: "player_kicked", playerId: targetPlayerId, players });

          // Close kicked player's connection
          for (const [cid, c] of clients) {
            if (c.playerId === targetPlayerId) {
              c.ws.send(JSON.stringify({ type: "kicked" }));
              c.ws.close();
              clients.delete(cid);
              break;
            }
          }
          break;
        }

        case "play_again": {
          const client = clients.get(clientId);
          if (!client) return;
          const room = storage.getRoom(client.roomId);
          if (!room || room.hostId !== client.playerId) return;

          // Reset scores
          const roomPlayers = storage.getRoomPlayers(client.roomId);
          for (const p of roomPlayers) {
            storage.updatePlayer(p.id, { score: 0 });
          }

          // New questions
          const questions = pickQuestions(room.totalRounds);
          roomQuestions.set(client.roomId, questions);

          storage.updateRoom(client.roomId, {
            status: "lobby",
            currentRound: 0,
            currentQuestion: null,
            currentCategory: null,
            answerDeadline: null,
          });

          const updatedPlayers = storage.getRoomPlayers(client.roomId);
          broadcastToRoom(client.roomId, {
            type: "game_reset",
            players: updatedPlayers,
            room: storage.getRoom(client.roomId),
          });
          break;
        }

        case "ping": {
          ws.send(JSON.stringify({ type: "pong" }));
          break;
        }
      }
    });

    ws.on("close", () => {
      const client = clients.get(clientId);
      if (client) {
        storage.updatePlayer(client.playerId, { isConnected: 0 });
        const players = storage.getRoomPlayers(client.roomId);
        broadcastToRoom(client.roomId, {
          type: "player_disconnected",
          playerId: client.playerId,
          players,
        });
        clients.delete(clientId);
      }
    });

    ws.send(JSON.stringify({ type: "connected" }));
  });

  // REST: get room state (for reconnecting)
  app.get("/api/room/:id", (req, res) => {
    const room = storage.getRoom(req.params.id.toUpperCase());
    if (!room) return res.status(404).json({ error: "Room not found" });
    const players = storage.getRoomPlayers(room.id);
    res.json({ room, players });
  });
}
