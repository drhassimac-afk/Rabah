CREATE TABLE "cards_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(8) NOT NULL,
	"player_x" varchar(100),
	"player_o" varchar(100),
	"drawn_cards_x" text DEFAULT '[]' NOT NULL,
	"drawn_cards_o" text DEFAULT '[]' NOT NULL,
	"scores" text DEFAULT '{"X":0,"O":0}' NOT NULL,
	"current_player" varchar(1) DEFAULT 'X' NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"winner" varchar(10),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cards_rooms_code_unique" UNIQUE("code")
);
