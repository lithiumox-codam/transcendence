import { vec2 } from "gl-matrix";

export interface GameState {
    players: Map<string, Player>;
    ball: {
        lastHit: string;
        pos: vec2;
        vel: vec2;
        speed: number;
    };
    gameOver: boolean;
}

interface Player {
    id: string;
    position: vec2;
    score: number;
    input: inputs;
    movementAxis: "x" | "y";
}

const VICTORY_SCORE = 7;
const axisX = 0;
const axisY = 1;
const ARENA_WIDTH = 40;
const ARENA_HEIGHT = 30;
const PADDLE_LENGTH = 8;
const BALL_SPEED = 5;
const PADDLE_SPEED = 10;
const BALL_SPEED_INCREASE = 1.05;
const COLLISION_COOLDOWN = 10;

export enum inputs {
    up = 1,
    down = -1,
    none = 0,
}

export class GameEngine {
    private state: GameState;
    private collisionCooldown = 0;

    constructor(private maxPlayers: 2 | 4) {
        console.log(
            "GameEngine constructror called with maxPlayers: ",
            maxPlayers,
        );
        this.state = this.initialState();
    }

    private initialState() {
        return {
            players: new Map(),
            ball: {
                lastHit: "",
                pos: vec2.create(),
                vel: this.randomDirection(),
                speed: BALL_SPEED,
            },
            gameOver: false,
        };
    }

    public addPlayer(playerId: string) {
        if (this.state.players.size >= this.maxPlayers) {
            throw new Error("Game is full");
        }

        let position: vec2;
        let movementAxis: "x" | "y" = "y";
        const playerCount = this.state.players.size;

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
                    position = vec2.fromValues(0, ARENA_HEIGHT / 2);
                    movementAxis = "x";
                    break;
                default:
                    position = vec2.fromValues(0, -ARENA_HEIGHT / 2);
                    movementAxis = "x";
                    break;
            }
        }
        this.state.players.set(playerId, {
            id: playerId,
            position,
            score: 0,
            input: inputs.none,
            movementAxis,
        });
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
    }

    public startGame(): void {
        setInterval(() => {
            this.update(1 / 60);
        }, 1000 / 60);
    }

    private updatePlayers(deltaTime: number): void {
        for (let i = 0; i < this.state.players.size; i++) {
            const player = this.state.players.get(`${i}`);

            if (!player) continue;
            const axis = player.movementAxis === "x" ? axisX : axisY;
            const newVal =
                player.position[axis] + player.input * PADDLE_SPEED * deltaTime;

            const middle = axis === 0 ? ARENA_WIDTH / 2 : ARENA_HEIGHT / 2;

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
        for (let i = 0; i < this.state.players.size; i++) {
            const player = this.state.players.get(`${i}`);
            if (!player) continue;
            const axis = player.movementAxis === "x" ? axisX : axisY;
            const paddlePos = player.position[axis];
            const ballPos = this.state.ball.pos;

            if (axis === axisY) {
            }
        }
    }

    // private handlePaddleCollision(player: Player, normal: vec2): void {
    //     const reflection = vec2.create();
    //     this.reflect(reflection, this.state.ball.vel, normal);
    //     vec2.normalize(this.state.ball.vel, reflection);

    //     this.state.ball.speed *= BALL_SPEED_INCREASE;
    //     this.state.ball.lastHit = player.id;
    //     this.collisionCooldown = 10;
    // }

    // private handleWallCollision(normal: vec2): void
    //     this.reflect(this.state.ball.vel, this.state.ball.vel, normal);

    // private updateBall(deltaTime: number): void
    //     vec2.scaleAndAdd(
    //         this.state.ball.pos,
    //         this.state.ball.pos,
    //         this.state.ball.vel,
    //         this.state.ball.speed * deltaTime,
    //     );

    private reflect(out: vec2, v: vec2, normal: vec2): vec2 {
        const dotProduct = vec2.dot(v, normal); // Compute dot product
        const scaledNormal = vec2.create();
        vec2.scale(scaledNormal, normal, 2 * dotProduct); // Scale normal by 2 * dotProduct
        return vec2.subtract(out, v, scaledNormal); // Compute reflection
    }

    public forceScore(playerId: string): void {
        const player = this.state.players.get(playerId);
        if (!player) {
            return;
        }
        player.score++;
        if (player.score >= VICTORY_SCORE) {
            this.state.gameOver = true;
        }
    }

    public resetGame(): void {
        this.state = this.initialState();
    }
}
