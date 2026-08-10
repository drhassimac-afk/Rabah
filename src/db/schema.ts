import { pgTable, serial, varchar, timestamp, text, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  pin: varchar("pin", { length: 10 }),
  isAdmin: boolean("is_admin").default(false),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 20 }),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streams = pgTable("streams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  isLive: boolean("is_live").default(true),
  streamUrl: text("stream_url"),
  viewers: integer("viewers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Stream = typeof streams.$inferSelect;

export const gameRooms = pgTable("game_rooms", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 8 }).notNull().unique(),
  playerX: varchar("player_x", { length: 100 }),
  playerO: varchar("player_o", { length: 100 }),
  board: text("board").notNull().default("[null,null,null,null,null,null,null,null,null]"),
  currentPlayer: varchar("current_player", { length: 1 }).notNull().default("X"),
  status: varchar("status", { length: 20 }).notNull().default("waiting"),
  winner: varchar("winner", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type GameRoom = typeof gameRooms.$inferSelect;
export type NewGameRoom = typeof gameRooms.$inferInsert;

