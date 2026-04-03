import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and } from "drizzle-orm";
import { rooms, players, answers } from "../shared/schema";
import type { Room, Player, Answer, InsertRoom, InsertPlayer, InsertAnswer } from "../shared/schema";

const sqlite = new Database("game.db");
export const db = drizzle(sqlite);

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    host_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'lobby',
    current_round INTEGER NOT NULL DEFAULT 0,
    total_rounds INTEGER NOT NULL DEFAULT 8,
    current_question TEXT,
    current_category TEXT,
    answer_deadline INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '🐄',
    score INTEGER NOT NULL DEFAULT 0,
    is_connected INTEGER NOT NULL DEFAULT 1,
    joined_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    round INTEGER NOT NULL,
    answer TEXT NOT NULL,
    submitted_at INTEGER NOT NULL
  );
`);

export interface IStorage {
  // Rooms
  getRoom(id: string): Room | undefined;
  createRoom(room: InsertRoom & { createdAt: number }): Room;
  updateRoom(id: string, updates: Partial<Room>): Room | undefined;
  deleteRoom(id: string): void;

  // Players
  getPlayer(id: string): Player | undefined;
  getRoomPlayers(roomId: string): Player[];
  createPlayer(player: InsertPlayer & { joinedAt: number }): Player;
  updatePlayer(id: string, updates: Partial<Player>): Player | undefined;
  removePlayer(id: string): void;

  // Answers
  getAnswer(roomId: string, playerId: string, round: number): Answer | undefined;
  getRoundAnswers(roomId: string, round: number): Answer[];
  createAnswer(answer: InsertAnswer & { submittedAt: number }): Answer;
  clearRoundAnswers(roomId: string, round: number): void;
}

class Storage implements IStorage {
  getRoom(id: string): Room | undefined {
    return db.select().from(rooms).where(eq(rooms.id, id)).get();
  }

  createRoom(room: InsertRoom & { createdAt: number }): Room {
    return db.insert(rooms).values(room).returning().get();
  }

  updateRoom(id: string, updates: Partial<Room>): Room | undefined {
    return db.update(rooms).set(updates).where(eq(rooms.id, id)).returning().get();
  }

  deleteRoom(id: string): void {
    db.delete(rooms).where(eq(rooms.id, id)).run();
  }

  getPlayer(id: string): Player | undefined {
    return db.select().from(players).where(eq(players.id, id)).get();
  }

  getRoomPlayers(roomId: string): Player[] {
    return db.select().from(players).where(eq(players.roomId, roomId)).all();
  }

  createPlayer(player: InsertPlayer & { joinedAt: number }): Player {
    return db.insert(players).values(player).returning().get();
  }

  updatePlayer(id: string, updates: Partial<Player>): Player | undefined {
    return db.update(players).set(updates).where(eq(players.id, id)).returning().get();
  }

  removePlayer(id: string): void {
    db.delete(players).where(eq(players.id, id)).run();
  }

  getAnswer(roomId: string, playerId: string, round: number): Answer | undefined {
    return db.select().from(answers)
      .where(and(eq(answers.roomId, roomId), eq(answers.playerId, playerId), eq(answers.round, round)))
      .get();
  }

  getRoundAnswers(roomId: string, round: number): Answer[] {
    return db.select().from(answers)
      .where(and(eq(answers.roomId, roomId), eq(answers.round, round)))
      .all();
  }

  createAnswer(answer: InsertAnswer & { submittedAt: number }): Answer {
    return db.insert(answers).values(answer).returning().get();
  }

  clearRoundAnswers(roomId: string, round: number): void {
    db.delete(answers).where(and(eq(answers.roomId, roomId), eq(answers.round, round))).run();
  }
}

export const storage = new Storage();
