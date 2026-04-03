import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(),           // 4-letter code e.g. "ABCD"
  hostId: text("host_id").notNull(),
  status: text("status").notNull().default("lobby"), // lobby | question | answering | revealing | scores | finished
  currentRound: integer("current_round").notNull().default(0),
  totalRounds: integer("total_rounds").notNull().default(8),
  currentQuestion: text("current_question"),
  currentCategory: text("current_category"),
  answerDeadline: integer("answer_deadline"),  // unix ms
  createdAt: integer("created_at").notNull(),
});

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("🐄"),
  score: integer("score").notNull().default(0),
  isConnected: integer("is_connected").notNull().default(1),
  joinedAt: integer("joined_at").notNull(),
});

export const answers = sqliteTable("answers", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull(),
  playerId: text("player_id").notNull(),
  round: integer("round").notNull(),
  answer: text("answer").notNull(),
  submittedAt: integer("submitted_at").notNull(),
});

// Insert schemas
export const insertRoomSchema = createInsertSchema(rooms).omit({ createdAt: true });
export const insertPlayerSchema = createInsertSchema(players).omit({ joinedAt: true });
export const insertAnswerSchema = createInsertSchema(answers).omit({ submittedAt: true });

// Types
export type Room = typeof rooms.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
