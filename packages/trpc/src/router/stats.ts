import { db, games, players, users } from "@repo/database";
import { and, count, desc, eq, max, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc.ts";
import { z } from "zod";

export const statsRouter = createTRPCRouter({
    leaderboard: protectedProcedure.query(async () => {
        // Query top 10 players by score and include user details
        const leaderboard = await db
            .select({
                userId: players.userId,
                userName: users.name,
                userEmail: users.email,
                totalScore: sql<number>`sum(${players.score})`.as("totalScore"),
                gamesPlayed: sql<number>`count(${players.gameId})`.as(
                    "gamesPlayed",
                ),
            })
            .from(players)
            .innerJoin(users, eq(players.userId, users.id))
            .innerJoin(games, eq(players.gameId, games.id))
            .where(eq(games.status, "finished"))
            .groupBy(players.userId)
            .orderBy(desc(sql`totalScore`))
            .limit(10);

        return leaderboard;
    }),

    userStats: protectedProcedure
        .input(z.number().optional() )
        .query(async ({ ctx, input }) => {
            const userId = input === undefined ? ctx.user.id : input; 

            // Get user's game stats
            const userGames = await db
                .select({
                    totalGames: sql<number>`count(${players.gameId})`.as(
                        "totalGames",
                    ),
                    totalScore: sql<number>`sum(${players.score})`.as(
                        "totalScore",
                    ),
                    averageScore: sql<number>`avg(${players.score})`.as(
                        "averageScore",
                    ),
                    highestScore: max(players.score),
                })
                .from(players)
                .innerJoin(games, eq(players.gameId, games.id))
                .where(
                    and(
                        eq(players.userId, userId),
                        eq(games.status, "finished"),
                    ),
                )
                .groupBy(players.userId);

            // Get user's win count (assuming highest score in a game is the winner)
            const maxScoresSubquery = db
                .select({
                    gameId: players.gameId,
                    maxScore: max(players.score).as("maxScore"),
                })
                .from(players)
                .groupBy(players.gameId)
                .as("maxScores");

            const winCount = await db
                .select({
                    count: count().as("count"),
                })
                .from(players)
                .innerJoin(
                    maxScoresSubquery,
                    and(
                        eq(players.gameId, maxScoresSubquery.gameId),
                        eq(players.score, maxScoresSubquery.maxScore),
                    ),
                )
                .innerJoin(games, eq(players.gameId, games.id))
                .where(
                    and(
                        eq(players.userId, userId),
                        eq(games.status, "finished"),
                    ),
                );

            // Calculate win-loss ratio and return stats
            const userStats = userGames[0] || {
                totalGames: 0,
                totalScore: 0,
                averageScore: 0,
                highestScore: 0,
            };

            const wins = winCount[0]?.count || 0;
            const losses = userStats.totalGames - wins;
            const winLossRatio =
                userStats.totalGames > 0 ? wins / userStats.totalGames : 0;

            return {
                ...userStats,
                wins,
                losses,
                winLossRatio,
            };
        }),

    userGameHistory: protectedProcedure
		.input(z.number().optional())
		.query(async ({ ctx, input }) => {
			const userId = input === undefined ? ctx.user.id : input;

			// Get user's recent game history
			const gameHistory = await db
				.select({
					gameId: games.id,
					playerScore: players.score,
					gameStatus: games.status,
					createdAt: games.createdAt,
					updatedAt: games.updatedAt,
				})
				.from(players)
				.innerJoin(games, eq(players.gameId, games.id))
				.where(eq(players.userId, userId))
				.orderBy(desc(games.updatedAt))
				.limit(10);

			return gameHistory;
   		}),
	});
