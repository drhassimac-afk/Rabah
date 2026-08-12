import { relations } from "drizzle-orm/relations";
import { users, messages, posts, streams, gameInvites } from "./schema";

export const messagesRelations = relations(messages, ({one}) => ({
	user_senderId: one(users, {
		fields: [messages.senderId],
		references: [users.id],
		relationName: "messages_senderId_users_id"
	}),
	user_receiverId: one(users, {
		fields: [messages.receiverId],
		references: [users.id],
		relationName: "messages_receiverId_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	messages_senderId: many(messages, {
		relationName: "messages_senderId_users_id"
	}),
	messages_receiverId: many(messages, {
		relationName: "messages_receiverId_users_id"
	}),
	posts: many(posts),
	streams: many(streams),
	gameInvites_senderId: many(gameInvites, {
		relationName: "gameInvites_senderId_users_id"
	}),
	gameInvites_receiverId: many(gameInvites, {
		relationName: "gameInvites_receiverId_users_id"
	}),
}));

export const postsRelations = relations(posts, ({one}) => ({
	user: one(users, {
		fields: [posts.userId],
		references: [users.id]
	}),
}));

export const streamsRelations = relations(streams, ({one}) => ({
	user: one(users, {
		fields: [streams.userId],
		references: [users.id]
	}),
}));

export const gameInvitesRelations = relations(gameInvites, ({one}) => ({
	user_senderId: one(users, {
		fields: [gameInvites.senderId],
		references: [users.id],
		relationName: "gameInvites_senderId_users_id"
	}),
	user_receiverId: one(users, {
		fields: [gameInvites.receiverId],
		references: [users.id],
		relationName: "gameInvites_receiverId_users_id"
	}),
}));