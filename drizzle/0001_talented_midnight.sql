CREATE TABLE "memory_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(8) NOT NULL,
	"player_x" varchar(100),
	"player_o" varchar(100),
	"board" text NOT NULL,
	"matched_pairs" text DEFAULT '[]' NOT NULL,
	"flipped_cards" text DEFAULT '[]' NOT NULL,
	"current_player" varchar(1) DEFAULT 'X' NOT NULL,
	"scores" text DEFAULT '{"X":0,"O":0}' NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"winner" varchar(10),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "memory_rooms_code_unique" UNIQUE("code")
);
