import { vec2 } from "gl-matrix";

export interface Player {
    id: number;
    position: vec2;
    score: number;
    input: "up" | "down" | "none";
    movementAxis: "x" | "y";
}
