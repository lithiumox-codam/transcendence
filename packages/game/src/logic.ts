// import { emitter } from "@repo/trpc/events/emitter.ts";
import { vec2 } from "gl-matrix";

export interface GameState {
    players: Player[];
    ball: {
        lastHit: number | null;
        pos: vec2;
        vel: vec2;
        speed: number;
    };
    gameOver: boolean;
}

export interface Player {
    id: number;
    position: vec2;
    score: number;
    input: playerInputs;
    movementAxis: "x" | "y";
}

const VICTORY_SCORE = 7;
const axisX = 0;
const axisY = 1;
const ARENA_WIDTH = 40;
const PADDLE_LENGTH = 8;
const BALL_SPEED = 10;
const PADDLE_SPEED = 15;
const BALL_SPEED_INCREASE = 1.1;
const COLLISION_COOLDOWN = 10;

export enum playerInputs {
    up = 1,
    down = -1,
    none = 0,
}

export class GameEngine {
    private state: GameState;
    private collisionCooldown = 0;
    private arenaHeight: 30 | 40 = 30;

    constructor(
        private maxPlayers: 2 | 4,
        playerId: number,
    ) {
        console.log(
            "GameEngine constructror called with maxPlayers: ",
            maxPlayers,
        );
        this.state = this.initialState();
        if (maxPlayers === 4) {
            this.arenaHeight = 40;
        }
        this.addPlayer(playerId);
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
            gameOver: false,
        };
    }

    public addPlayer(playerId: number) {
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
            input: playerInputs.none,
            movementAxis,
        };
    }

    private randomDirection(): vec2 {
        const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
        return vec2.fromValues(
            Math.random() < 0.5 ? Math.cos(angle) : -Math.cos(angle),
            Math.sin(angle),
        );
    }

    public getState(): GameState {
        return this.state;
    }

    private update(deltaTime: number): void {
        if (this.state.gameOver) return;

        this.updatePlayers(deltaTime);
        this.updateBall(deltaTime);
        this.checkCollisions();
        this.checkScore();
    }

    public startGame(): void {
        setInterval(() => {
            this.update(1 / 480);
        }, 1000 / 480);
    }

    public setPlayerInput(playerId: number, input: playerInputs): void {
        const player = this.state.players.find((p) => p.id === playerId);
        if (!player) {
            return;
        }
        console.log("set player input", playerId, input);
        player.input = input;
    }

    public testWithPlayerInput(input: playerInputs): void {
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
                player.position[axis] + player.input * PADDLE_SPEED * deltaTime;

            const middle = axis === 0 ? ARENA_WIDTH / 2 : this.arenaHeight / 2;

            player.position[axis] = Math.max(
                -middle + PADDLE_LENGTH / 2,
                Math.min(middle - PADDLE_LENGTH / 2, newVal),
            );
        }
    }

    private updateBall(deltaTime: number): void {
        vec2.scaleAndAdd(
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
        if (this.maxPlayers === 2) {
            const ballPos = this.state.ball.pos;

            if (
                ballPos[axisY] > this.arenaHeight / 2 - 0.5 ||
                ballPos[axisY] < -this.arenaHeight / 2 + 0.5
            ) {
                this.state.ball.vel[axisY] *= -1;
            }
            if (this.state.players[0])
                this.handlePaddleCollision(this.state.players[0]);
            if (this.state.players[1])
                this.handlePaddleCollision(this.state.players[1]);
        }
    }

    private handlePaddleCollision(player: Player): void {
        const ballPos = this.state.ball.pos;
        const axis = player.movementAxis === "x" ? axisX : axisY;
        const bounceAxis = player.movementAxis === "x" ? axisY : axisX;
        const paddleLength = PADDLE_LENGTH / 2;
        const paddleTop = player.position[axis] - paddleLength;
        const paddleBottom = player.position[axis] + paddleLength;
        const paddleNormal = this.getPaddleNormal(player);

        if (ballPos[axis] > paddleTop && ballPos[axis] < paddleBottom) {
            if (
                ballPos[bounceAxis] > player.position[bounceAxis] - 0.5 &&
                ballPos[bounceAxis] < player.position[bounceAxis] + 0.5
            ) {
                this.reflect(
                    this.state.ball.vel,
                    this.state.ball.vel,
                    paddleNormal,
                );
                this.state.ball.speed *= BALL_SPEED_INCREASE;
                this.state.ball.lastHit = player.id;
                this.collisionCooldown = COLLISION_COOLDOWN;
            }
        }
    }

    private getPaddleNormal(player: Player): vec2 {
        switch (player.id) {
            case 0:
                return vec2.fromValues(1, 0);
            case 1:
                return vec2.fromValues(-1, 0);
            case 2:
                return vec2.fromValues(0, -1);
            default:
                return vec2.fromValues(0, 1);
        }
    }

    private checkScore(): void {
        const pos = this.state.ball.pos;
        let scoringId: number | null = null;
        if (pos[0] > ARENA_WIDTH / 2 || pos[0] < -ARENA_WIDTH / 2) {
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
                    this.state.gameOver = true;
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

    private reflect(out: vec2, v: vec2, normal: vec2): vec2 {
        const dotProduct = vec2.dot(v, normal);
        const scaledNormal = vec2.create();
        vec2.scale(scaledNormal, normal, 2 * dotProduct);
        return vec2.subtract(out, v, scaledNormal);
    }

    // public forceScore(playerId: number): void {
    //     const player = this.state.players.find((p) => p.id === playerId);
    //     if (!player) {
    //         return;
    //     }
    //     player.score++;
    //     if (player.score >= VICTORY_SCORE) {
    //         this.state.gameOver = true;
    //     }
    // }

    public reset(): void {
        this.state.ball = {
            lastHit: null,
            pos: vec2.create(),
            vel: this.randomDirection(),
            speed: BALL_SPEED,
        };
        this.state.gameOver = false;
    }
}
