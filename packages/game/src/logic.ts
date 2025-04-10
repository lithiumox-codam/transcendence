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
    input: "up" | "down" | "none";
    movementAxis: "x" | "y";
}

const VICTORY_SCORE = 7;
const axisX = 0;
const axisY = 1;
const ARENA_WIDTH = 40;
// const arenaRadius = ARENA_WIDTH / 2;
const PADDLE_LENGTH = 6;
const BALL_SPEED = 10;
const PADDLE_SPEED = 20;
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
        playerIds: number[],
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
            gameOver: false,
        };
    }

    private directionToNumber(direction: "up" | "down" | "none"): playerInputs {
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

    private update(deltaTime: number): void {
        if (this.state.gameOver) return;

        this.updatePlayers(deltaTime);
        this.updateBall(deltaTime);
        this.checkCollisions(deltaTime);
        this.checkScore();
    }

    public startGame(): void {
        setInterval(() => {
            this.update(1 / 240);
        }, 1000 / 240);
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

    private pointCollision(p1: number, p2: number, p3: number): boolean {
        if ((p1 >= Math.min(p2, p3) && p1 <= Math.max(p2, p3)) === true) {
            return true;
        }
        return false;
    }

    private checkCollisions(deltaTime: number): void {
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= deltaTime;
        }
        const ballPos = this.state.ball.pos;
        if (this.maxPlayers === 2) {
            if (
                ballPos[axisY] > this.arenaHeight / 2 - 0.5 ||
                ballPos[axisY] < -this.arenaHeight / 2 + 0.5
            ) {
                this.state.ball.vel[axisY] *= -1;
            }
        }
        for (let i = 0; i < this.state.players.length; i++) {
            const player = this.state.players[i];
            if (!player) continue;
            if (this.state.ball.lastHit === player.id) {
                continue;
            }
            if (this.handlePaddleCollision(player)) break;
        }
    }

    private checkBorder(axis: number, positive: boolean): boolean {
        const pos = this.state.ball.pos;
        if (!pos[axis]) return false;
        if (positive === true) {
            if (
                pos[axis] + 0.5 >= ARENA_WIDTH / 2 ||
                pos[axis] + 0.5 >= this.arenaHeight / 2
            ) {
                return true;
            }
        }
        if (
            pos[axisX] - 0.5 <= -ARENA_WIDTH / 2 ||
            pos[axisY] - 0.5 <= -this.arenaHeight / 2
        ) {
            return true;
        }
        return false;
    }

    private handlePaddleCollision(player: Player): boolean {
        const ballPos = this.state.ball.pos;
        const axis = player.movementAxis === "x" ? axisX : axisY;
        const bounceAxis = player.movementAxis === "x" ? axisY : axisX;
        const PADDLE_VELOCITY_FACTOR = 0.01;

        if (
            this.checkBorder(bounceAxis, ballPos[axis] > 0) &&
            this.pointCollision(
                ballPos[axis],
                player.position[axis] - 3,
                player.position[axis] + 3,
            ) &&
            ((ballPos[bounceAxis] > 0 && player.position[bounceAxis] > 0) ||
                (ballPos[bounceAxis] < 0 && player.position[bounceAxis] < 0))
        ) {
            this.state.ball.vel[bounceAxis] *= -1;

            const paddleDirection = this.directionToNumber(player.input);
            const movementAxis = player.movementAxis === "x" ? axisX : axisY;
            const velocityBoost =
                paddleDirection * PADDLE_SPEED * PADDLE_VELOCITY_FACTOR;
            this.state.ball.vel[movementAxis] += velocityBoost;

            vec2.normalize(this.state.ball.vel, this.state.ball.vel);
            this.state.ball.speed *= BALL_SPEED_INCREASE;
            this.state.ball.lastHit = player.id;
            this.collisionCooldown = COLLISION_COOLDOWN;
            // console.log("ballPos: ", ballPos);
            return true;
        }
        return false;
    }

    private reflectVector(v: vec2, n: vec2): vec2 {
        const dotProduct = v[axisX] * n[axisX] + v[axisY] * n[axisY];

        return vec2.fromValues(
            v[axisX] - 2 * dotProduct * n[axisX],
            v[axisY] - 2 * dotProduct * n[axisY],
        );
    }

    private getPaddleNormal(player: Player): vec2 {
        const axis = player.movementAxis === "x" ? axisX : axisY;
        const positive = player.position[axis] > 0;

        if (axis === axisX) {
            if (positive) {
                return vec2.fromValues(0, -1);
            }
            return vec2.fromValues(0, 1);
        }
        if (positive) {
            return vec2.fromValues(-1, 0);
        }
        return vec2.fromValues(1, 0);
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
        this.state.gameOver = false;
    }
}
