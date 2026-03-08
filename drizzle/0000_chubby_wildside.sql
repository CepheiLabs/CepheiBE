CREATE TYPE "public"."game_category" AS ENUM('COIN_FLIP', 'DICE_ROLL');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."raffle_status" AS ENUM('OPEN', 'CLOSE');--> statement-breakpoint
CREATE TYPE "public"."token_purpose" AS ENUM('PASSWORD_RESET', 'VERIFY_EMAIL');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('DEPOSIT', 'WITHDRAWAL');--> statement-breakpoint
CREATE TABLE "fees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" numeric(32, 18) NOT NULL,
	"source_contract" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "game_category" NOT NULL,
	"status" "game_status" DEFAULT 'PENDING' NOT NULL,
	"stake" numeric(32, 18) NOT NULL,
	"host_id" uuid NOT NULL,
	"opponent_id" uuid,
	"winner_id" uuid,
	"game_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tx_hash" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "games_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255),
	"google_id" varchar(255),
	"wallet_address" varchar(255),
	"username" varchar(255),
	"password" text,
	"avatar_url" text,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"is_verified_email" boolean DEFAULT false NOT NULL,
	"total_games" integer DEFAULT 0 NOT NULL,
	"total_wins" integer DEFAULT 0 NOT NULL,
	"total_losses" integer DEFAULT 0 NOT NULL,
	"total_earnings" numeric(32, 18) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone,
	CONSTRAINT "players_email_unique" UNIQUE("email"),
	CONSTRAINT "players_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "players_wallet_address_unique" UNIQUE("wallet_address"),
	CONSTRAINT "players_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "raffles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_price" numeric(32, 18) NOT NULL,
	"total_pool" numeric(32, 18) DEFAULT '0' NOT NULL,
	"entries_count" integer DEFAULT 0 NOT NULL,
	"status" "raffle_status" DEFAULT 'OPEN' NOT NULL,
	"winner_id" uuid,
	"tx_hash" varchar(255),
	"ends_at" timestamp NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid,
	"token_hash" varchar(255),
	"purpose" "token_purpose" NOT NULL,
	"expires_at" timestamp with time zone,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"tx_type" "tx_type" NOT NULL,
	"amount" numeric(32, 18) NOT NULL,
	"tx_hash" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_tx_hash_unique" UNIQUE("tx_hash")
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_host_id_players_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_opponent_id_players_id_fk" FOREIGN KEY ("opponent_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_winner_id_players_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raffles" ADD CONSTRAINT "raffles_winner_id_players_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wins_idx" ON "players" USING btree ("total_wins");--> statement-breakpoint
CREATE INDEX "total_earnings_idx" ON "players" USING btree ("total_earnings");--> statement-breakpoint
CREATE INDEX "token_purpose_index" ON "tokens" USING btree ("player_id","purpose");--> statement-breakpoint
CREATE UNIQUE INDEX "active_token_unique" ON "tokens" USING btree ("player_id","purpose") WHERE used=false;--> statement-breakpoint
CREATE INDEX "player_id_idx" ON "transactions" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "transactions" USING btree ("created_at");