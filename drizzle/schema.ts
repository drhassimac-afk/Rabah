import { pgTable, unique, serial, varchar, text, timestamp, boolean, foreignKey, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const gameRooms = pgTable("game_rooms", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 8 }).notNull(),
	playerX: varchar("player_x", { length: 100 }),
	playerO: varchar("player_o", { length: 100 }),
	board: text().default('[null,null,null,null,null,null,null,null,null]').notNull(),
	currentPlayer: varchar("current_player", { length: 1 }).default('X').notNull(),
	status: varchar({ length: 20 }).default('waiting').notNull(),
	winner: varchar({ length: 10 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("game_rooms_code_unique").on(table.code),
]);

export const memoryRooms = pgTable("memory_rooms", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 8 }).notNull(),
	playerX: varchar("player_x", { length: 100 }),
	playerO: varchar("player_o", { length: 100 }),
	board: text().notNull(),
	matchedPairs: text("matched_pairs").default('[]').notNull(),
	flippedCards: text("flipped_cards").default('[]').notNull(),
	currentPlayer: varchar("current_player", { length: 1 }).default('X').notNull(),
	scores: text().default('{"X":0,"O":0}').notNull(),
	status: varchar({ length: 20 }).default('waiting').notNull(),
	winner: varchar({ length: 10 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("memory_rooms_code_unique").on(table.code),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 50 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	pin: varchar({ length: 10 }),
	isAdmin: boolean("is_admin").default(false),
	avatar: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	senderId: integer("sender_id").notNull(),
	receiverId: integer("receiver_id").notNull(),
	content: text().notNull(),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "messages_sender_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.id],
			name: "messages_receiver_id_users_id_fk"
		}),
]);

export const posts = pgTable("posts", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	content: text().notNull(),
	mediaUrl: text("media_url"),
	mediaType: varchar("media_type", { length: 20 }),
	likes: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "posts_user_id_users_id_fk"
		}),
]);

export const streams = pgTable("streams", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	isLive: boolean("is_live").default(true),
	streamUrl: text("stream_url"),
	viewers: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "streams_user_id_users_id_fk"
		}),
]);

export const quizRooms = pgTable("quiz_rooms", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 8 }).notNull(),
	playerX: varchar("player_x", { length: 100 }),
	playerO: varchar("player_o", { length: 100 }),
	questions: text().notNull(),
	currentQuestion: integer("current_question").default(0).notNull(),
	answersX: text("answers_x").default('[]').notNull(),
	answersO: text("answers_o").default('[]').notNull(),
	scores: text().default('{"X":0,"O":0}').notNull(),
	status: varchar({ length: 20 }).default('waiting').notNull(),
	winner: varchar({ length: 10 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("quiz_rooms_code_unique").on(table.code),
]);

export const cardsRooms = pgTable("cards_rooms", {
	id: serial().primaryKey().notNull(),
	code: varchar({ length: 8 }).notNull(),
	playerX: varchar("player_x", { length: 100 }),
	playerO: varchar("player_o", { length: 100 }),
	drawnCardsX: text("drawn_cards_x").default('[]').notNull(),
	drawnCardsO: text("drawn_cards_o").default('[]').notNull(),
	scores: text().default('{"X":0,"O":0}').notNull(),
	currentPlayer: varchar("current_player", { length: 1 }).default('X').notNull(),
	status: varchar({ length: 20 }).default('waiting').notNull(),
	winner: varchar({ length: 10 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("cards_rooms_code_unique").on(table.code),
]);

export const gameInvites = pgTable("game_invites", {
	id: serial().primaryKey().notNull(),
	senderId: integer("sender_id").notNull(),
	receiverId: integer("receiver_id").notNull(),
	game: varchar({ length: 30 }).notNull(),
	roomCode: varchar("room_code", { length: 8 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "game_invites_sender_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.id],
			name: "game_invites_receiver_id_users_id_fk"
		}),
]);
