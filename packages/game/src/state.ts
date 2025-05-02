import { vec2 } from "gl-matrix";
import { Player } from "./player.ts";

export type GameStatus = "waiting" | "playing" | "finished";

export interface GameState {
    players: Player[];
    ball: {
        lastHit: number | null;
        pos: vec2;
        vel: vec2;
        speed: number;
    };
    status: GameStatus;
}
