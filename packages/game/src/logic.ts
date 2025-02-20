import { is } from "drizzle-orm";

interface Vec2 {
    x: number;
    y: number;
}

export interface GameState {
    players: Map<string, Player>;
    boundaries: Boundary[];
    ball: {
        lastHit: string;
        pos: Vec2;
        vel: Vec2;
    };
}

interface Player {
    id: string;
    angle: number;
    y: number;
    score: number;
    input: inputs;
}

interface Boundary {
    start: Vec2;
    end: Vec2;
    normal: Vec2;
    hasPaddle: boolean;
    playerId: string | null;
}

const VICTORY_SCORE = 7;
const UP_BOUND = 15;
const LOW_BOUND = -15;
const LEFT_BOUND = -20.5;
const RIGHT_BOUND = 20.5;
const PADDLE_HEIGHT = 2;
const PADDLE_WIDTH = 0.5;
const BALL_SIZE = 0.5;
const BALL_SPEED = 0.1;
const PADDLE_SPEED = 0.2;
const BALL_SPEED_INCREASE = 1.05;
const COLLISION_COOLDOWN_FRAMES = 10;

export enum inputs {
    up = 0.2,
    down = -0.2,
    none = 0,
}

export class GameEngine {
    private state: GameState;
    private collisionCooldown = 0;
    private players: Map<string, inputs>;
    private readonly radius: number;

    constructor(private maxPlayers: number) {
        this.radius = 20;
        this.state = this.initialState();
        this.players = new Map();
    }
    private initialState() {
        return {
            players: new Map(),
            ball: {
                lastHit: "",
                pos: { x: 0, y: 0 },
                vel: this.randomDirection(),
                speed: BALL_SPEED,
            },
            boundaries: [],
            gameOver: false,
        };
    }

    private getSides(): number {
        switch (this.maxPlayers) {
            case 2:
                return 4;
            case 3:
                return 6;
            default:
                return this.maxPlayers;
        }
    }

    private generateBoundaries(): void {
        const sides = this.getSides();
        const angleStep = (2 * Math.PI) / sides;

        for (let i = 0; i < sides; i++) {
            const angle = i * angleStep;

            const start = this.calculatePolygonPoint(angle);
            const end = this.calculatePolygonPoint(angle + angleStep);

            let isPaddle = true;
            if (
                (this.maxPlayers === 2 || this.maxPlayers === 3) &&
                i % 2 === 1
            ) {
                isPaddle = false;
            }
            const boundary: Boundary = {
                start,
                end,
                normal: this.calculateNormal(angle),
                hasPaddle: isPaddle,
                playerId: null,
            };
            if (isPaddle) {
                boundary.playerId = `paddle-${i}`;
            }
            this.state.boundaries.push(boundary);
        }
    }

    private calculatePolygonPoint(angle: number): Vec2 {
        return {
            x: this.radius * Math.cos(angle),
            y: this.radius * Math.sin(angle),
        };
    }

    private calculateNormal(angle: number): Vec2 {
        return {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };
    }

    public addPlayer(playerId: string) {
        if (this.players.size >= this.maxPlayers) {
            throw new Error("Game is full");
        }
        const angle = this.calculateInitialAngle;
        const player: Player = {
            id: playerId,
            angle: this.calculateInitialAngle(this.players.size),
            y: 0,
            score: 0,
            input: inputs.none,
        };
        this.state.players.set(playerId, player);
    }

    private calculateInitialAngle(player: number): number {
        const sides = this.getSides();
        return (2 * Math.PI * Math.floor(Math.random() * sides)) / sides;
    }

    public removePlayer(playerId: string) {
        this.players.delete(playerId);
    }

    public setPlayerInput(playerId: string, input: inputs) {
        if (!this.players.has(playerId)) {
            throw new Error("Player not found");
        }
        this.players.set(playerId, input);
    }

    private movePaddles() {
        for (const [playerId, input] of this.players) {
            const paddle = this.state.players.get(playerId);
            if (!paddle || input === inputs.none) {
                continue;
            }
            if (input === inputs.up && paddle.y + PADDLE_HEIGHT < UP_BOUND) {
                paddle.y += PADDLE_SPEED;
            }
            if (input === inputs.down && paddle.y - PADDLE_HEIGHT > LOW_BOUND) {
                paddle.y -= PADDLE_SPEED;
            }
        }
    }

    private randomDirection(): Vec2 {
        const anglex = Math.random() * Math.PI * 2;
        const angley = Math.random() * Math.PI * 2;
        return {
            x: Math.cos(anglex),
            y: Math.sin(angley),
        };
    }

    private updatePaddlePositions(): void {
        for (let i = 0; i < this.state.boundaries.length; i++) {
            const boundary = this.state.boundaries[i];
            if (!boundary) continue;
            if (!boundary.playerId) continue;

            const player = this.state.players.get(boundary.playerId);
            if (!player) continue;

            const angle = Math.atan2(boundary.normal.y, boundary.normal.x);
            boundary.start = this.calculatePolygonPoint(angle - PADDLE_HEIGHT);
            boundary.end = this.calculatePolygonPoint(angle + PADDLE_HEIGHT);
        }
    }

    private resetBall(): void {
        this.state.ball = {
            lastHit: "",
            pos: { x: 0, y: 0 },
            vel: this.randomDirection(),
        };
    }
}
