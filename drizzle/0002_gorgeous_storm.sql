CREATE TABLE "quiz_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(8) NOT NULL,
	"player_x" varchar(100),
	"player_o" varchar(100),
	"questions" text NOT NULL,
	"current_question" integer DEFAULT 0 NOT NULL,
	"answers_x" text DEFAULT '[]' NOT NULL,
	"answers_o" text DEFAULT '[]' NOT NULL,
	"scores" text DEFAULT '{"X":0,"O":0}' NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"winner" varchar(10),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "quiz_rooms_code_unique" UNIQUE("code")
);
