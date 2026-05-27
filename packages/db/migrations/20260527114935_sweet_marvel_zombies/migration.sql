ALTER TABLE "auctions" ADD COLUMN "min_players_per_squad" integer;--> statement-breakpoint
ALTER TABLE "auctions" ADD COLUMN "max_players_per_squad" integer;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "min_players_per_category" integer;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "max_players_per_category" integer;