import { vec2 } from "gl-matrix";
import { GameState, GameStatus } from "./state.ts";
import { Player } from "./player.ts";

const VICTORY_SCORE = 5;
const axisX = 0;
const axisY = 1;
const ARENA_WIDTH = 40;
const PADDLE_LENGTH = 6;
const BALL_SPEED = 10;
const PADDLE_SPEED = 20;
const BALL_SPEED_INCREASE = 1.05;
const COLLISION_COOLDOWN = 10;

export class GameEngine {
    private state: GameState;
    private collisionCooldown = 0;
    private arenaHeight: 30 | 40 = 30;

    constructor(
        private maxPlayers: 2 | 4,
        playerIds: number[],
        private tournamentId?: number,
    ) {
        console.log(
            "GameEngine constructror called with maxPlayers: ",
            maxPlayers,
        );
        this.state = this.initialState();
        if (maxPlayers === 4) {
            this.arenaHeight = 40;
        }
        for (const id of playerIds) {
            this.addPlayer(id);
        }
    }

    private initialState() {
        return {
            players: [],
            ball: {
                lastHit: null,
                pos: vec2.create(),
                vel: this.randomDirection(),
                speed: BALL_SPEED,
            },
            status: "waiting" as GameStatus,
        };
    }

    private directionToNumber(direction: "up" | "down" | "none"): number {
        switch (direction) {
            case "up":
                return 1;
            case "down":
                return -1;
            default:
                return 0;
        }
    }

    public addPlayer(playerId: number): void {
        if (this.state.players.length >= this.maxPlayers) {
            throw new Error("Game is full");
        }
        let position: vec2;
        let movementAxis: "x" | "y" = "y";
        const playerCount = this.state.players.length;

        if (this.maxPlayers === 2) {
            position =
                playerCount === 0
                    ? vec2.fromValues(-ARENA_WIDTH / 2, 0)
                    : vec2.fromValues(ARENA_WIDTH / 2, 0);
        } else {
            switch (playerCount) {
                case 0:
                    position = vec2.fromValues(-ARENA_WIDTH / 2, 0);
                    break;
                case 1:
                    position = vec2.fromValues(ARENA_WIDTH / 2, 0);
                    break;
                case 2:
                    position = vec2.fromValues(0, this.arenaHeight / 2);
                    movementAxis = "x";
                    break;
                default:
                    position = vec2.fromValues(0, -this.arenaHeight / 2);
                    movementAxis = "x";
                    break;
            }
        }
        this.state.players[this.state.players.length] = {
            id: playerId,
            position,
            score: 0,
            input: "none",
            movementAxis,
        };
        console.log("Player added with id: ", playerId);
    }

    private randomDirection(): vec2 {
        if (this.maxPlayers === 4) {
            const angle = Math.random() * 2 * Math.PI;
            return vec2.fromValues(Math.cos(angle), Math.sin(angle));
        }
        const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
        return vec2.fromValues(
            Math.random() < 0.5 ? Math.cos(angle) : -Math.cos(angle),
            Math.sin(angle),
        );
    }

    public getState(): GameState {
        return this.state;
    }

    public getTournamentId(): number | undefined {
        return this.tournamentId;
    }

    public getWinnerId(): number | null {
        if (this.state.status !== "finished") {
            return null;
        }
        const winner = this.state.players.reduce((prev, current) =>
            prev.score > current.score ? prev : current,
        );
        return winner.id;
    }

    public update(deltaTime: number): void {
        if (this.state.status !== "playing") return;

        this.updatePlayers(deltaTime);
        this.updateBall(deltaTime);
        this.checkCollisions();
        this.checkScore();
    }

    public setPlayerInput(
        playerId: number,
        input: "up" | "down" | "none",
    ): void {
        const player = this.state.players.find((p) => p.id === playerId);
        if (!player) {
            return;
        }
        player.input = input;
    }

    public testWithPlayerInput(input: "up" | "down" | "none"): void {
        for (let i = 0; i < this.state.players.length; i++) {
            const player = this.state.players[i];
            if (!player) continue;
            player.input = input;
        }
    }

    private updatePlayers(deltaTime: number): void {
        for (let i = 0; i < this.state.players.length; i++) {
            const player = this.state.players[i];

            if (!player) continue;
            const axis = player.movementAxis === "x" ? axisX : axisY;
            const newVal =
                player.position[axis] +
                this.directionToNumber(player.input) * PADDLE_SPEED * deltaTime;

            const middle = axis === 0 ? ARENA_WIDTH / 2 : this.arenaHeight / 2;

            player.position[axis] = Math.max(
                -middle + PADDLE_LENGTH / 2,
                Math.min(middle - PADDLE_LENGTH / 2, newVal),
            );
        }
    }

    private updateBall(deltaTime: number): void {
        this.state.ball.pos = vec2.scaleAndAdd(
            this.state.ball.pos,
            this.state.ball.pos,
            this.state.ball.vel,
            this.state.ball.speed * deltaTime,
        );
    }

    private checkCollisions(): void {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
            return;
        }

        const ballPos = this.state.ball.pos;

        if (this.maxPlayers === 2) {
            const verticalBounds = this.arenaHeight / 2;
            if (
                ballPos[axisY] > verticalBounds - 0.5 ||
                ballPos[axisY] < -verticalBounds + 0.5
            ) {
                this.state.ball.vel[axisY] *= -1;
            }
        }
        if (!this.isInScoringZone()) return;
        let collisionOccurred = false;
        for (const player of this.state.players) {
            if (!player || this.state.ball.lastHit === player.id) continue;

            if (this.handlePaddleCollision(player)) {
                collisionOccurred = true;
            }
        }
    }

    private isInScoringZone(): boolean {
        const pos = this.state.ball.pos;
        return (
            pos[axisX] + 0.5 > ARENA_WIDTH / 2 ||
            pos[axisX] - 0.5 < -ARENA_WIDTH / 2 ||
            pos[axisY] + 0.5 > this.arenaHeight / 2 ||
            pos[axisY] - 0.5 < -this.arenaHeight / 2
        );
    }

    private handlePaddleCollision(player: Player): boolean {
        const ballPos = this.state.ball.pos;
        const isVertical = player.movementAxis === "y";

        const paddleAxis = isVertical ? axisX : axisY;
        const lengthAxis = isVertical ? axisY : axisX;

        const paddleCenter = player.position[lengthAxis];
        const paddleStart = paddleCenter - PADDLE_LENGTH / 2;
        const paddleEnd = paddleCenter + PADDLE_LENGTH / 2;

        const planeDistance = Math.abs(
            ballPos[paddleAxis] - player.position[paddleAxis],
        );

        if (
            planeDistance <= 0.5 &&
            ballPos[lengthAxis] + 0.5 >= paddleStart &&
            ballPos[lengthAxis] - 0.5 <= paddleEnd &&
            this.isInScoringZone()
        ) {
            const normal = this.getPaddleNormal(player);
            this.reflectBall(normal, player);
            return true;
        }
        return false;
    }

    private getPaddleNormal(player: Player): vec2 {
        const pos = player.position;
        if (player.movementAxis === "y") {
            return vec2.fromValues(pos[axisX] > 0 ? -1 : 1, 0);
        }
        return vec2.fromValues(0, pos[axisY] > 0 ? -1 : 1);
    }

    private reflectBall(normal: vec2, player: Player): void {
        const originalSpeed = this.state.ball.speed;

        this.reflectVector(this.state.ball.vel, this.state.ball.vel, normal);

        const PADDLE_INFLUENCE = 0.1;
        const influenceAxis = player.movementAxis === "y" ? axisY : axisX;
        this.state.ball.vel[influenceAxis] +=
            this.directionToNumber(player.input) * PADDLE_INFLUENCE;

        vec2.normalize(this.state.ball.vel, this.state.ball.vel);
        this.state.ball.speed = originalSpeed * BALL_SPEED_INCREASE;

        this.state.ball.lastHit = player.id;
        this.collisionCooldown = COLLISION_COOLDOWN;
    }

    private reflectVector(out: vec2, v: vec2, normal: vec2): vec2 {
        const normalizedNormal = vec2.create();
        vec2.normalize(normalizedNormal, normal);

        const dot = vec2.dot(v, normalizedNormal);

        const x = v[0] - 2 * dot * normalizedNormal[0];
        const y = v[1] - 2 * dot * normalizedNormal[1];

        return vec2.set(out, x, y);
    }

    private checkScore(): void {
        const pos = this.state.ball.pos;
        let scoringId: number | null = null;
        if (
            pos[axisX] > ARENA_WIDTH / 2 + 1 ||
            pos[axisX] < -ARENA_WIDTH / 2 - 1 ||
            pos[axisY] > this.arenaHeight / 2 + 1 ||
            pos[axisY] < -this.arenaHeight / 2 - 1
        ) {
            scoringId = this.state.ball.lastHit;
            if (this.maxPlayers === 4) {
                if (
                    pos[1] > this.arenaHeight / 2 ||
                    pos[1] < -this.arenaHeight / 2
                ) {
                    scoringId = this.state.ball.lastHit;
                }
            }
            if (scoringId) {
                const player = this.state.players.find(
                    (p) => p.id === scoringId,
                );
                if (!player) return;
                player.score++;
                if (player.score >= VICTORY_SCORE) {
                    this.state.status = "finished";
                }
            }
            this.resetBall();
        }
    }

    private resetBall(): void {
        vec2.set(this.state.ball.pos, 0, 0);
        this.state.ball.vel = this.randomDirection();
        this.state.ball.speed = BALL_SPEED;
        this.state.ball.lastHit = null;
    }

    public reset(): void {
        this.state.ball = {
            lastHit: null,
            pos: vec2.create(),
            vel: this.randomDirection(),
            speed: BALL_SPEED,
        };
        for (let i = 0; i < this.state.players.length; i++) {
            const player = this.state.players[i];
            if (player) player.score = 0;
        }
        this.state.status = "waiting";
    }

    public start(): void {
        this.state.status = "playing";
    }
}
