import type { WebSocket } from "@fastify/websocket";
import {type FastifyInstance, FastifyRequest } from "fastify";

type GameState = {
  ball: {
	x: number;
	y: number;
	dx: number;
	dy: number;
  };
  paddles: {
	leftY: number;
	rightY: number;
  };
  scores: {
	left: number;
	right: number;
  };
}


function createGameState(): GameState {
  return {
	ball: {
	  x: 400,
	  y: 100,
	  dx: 3,
	  dy: 3,
	},
	paddles: {
	  leftY: 200,
	  rightY: 200,
	},
	scores: {
	  left: 0,
	  right: 0,
	},
  };
}

export class GameServer {
	private state = createGameState();

	private connections: WebSocket[] = [];

	constructor(private fastify: FastifyInstance) {
		this.setupRoutes();
		this.startGameLoop();
	  }
	
	  private setupRoutes() {
		this.fastify.get('/game/ws', { websocket: true }, (connection) => {
		  this.connections.push(connection);
		  
		  // Send initial state
		  connection.send(JSON.stringify(this.state));
	
		  connection.on('message', (message: string) => {
			const data = JSON.parse(message);
			this.handleInput(data);
		  });
	
		  connection.on('close', () => {
			this.connections = this.connections.filter(ws => ws !== connection);
		  });
		});
	  }
	
	  private handleInput(data: any) {
		// For testing: Allow single client to control both paddles
		if (data.leftY !== undefined) {
		  this.state.paddles.leftY = data.leftY;
		}
		if (data.rightY !== undefined) {
		  this.state.paddles.rightY = data.rightY;
		}
	  }
	
	  private startGameLoop() {
		setInterval(() => this.updateGame(), 1000 / 60);
	  }
	
	  private updateGame() {
		// Update ball position
		this.state.ball.x += this.state.ball.dx;
		this.state.ball.y += this.state.ball.dy;
	
		// Collision detection
		if (this.state.ball.y < 0 || this.state.ball.y > 600) {
		  this.state.ball.dy *= -1;
		}
	
		// Paddle collisions
		if (this.state.ball.x < 20 && 
			Math.abs(this.state.ball.y - this.state.paddles.leftY) < 40) {
		  this.state.ball.dx *= -1.1;
		}
	
		if (this.state.ball.x > 780 && 
			Math.abs(this.state.ball.y - this.state.paddles.rightY) < 40) {
		  this.state.ball.dx *= -1.1;
		}
	
		// Scoring
		if (this.state.ball.x < 0) {
		  this.state.scores.right++;
		  this.resetBall();
		}
		if (this.state.ball.x > 800) {
		  this.state.scores.left++;
		  this.resetBall();
		}
	
		// Broadcast to all connected clients
		this.broadcastState();
	  }
	
	  private resetBall() {
		this.state.ball = {
		  x: 400,
		  y: 300,
		  dx: Math.random() > 0.5 ? 3 : -3,
		  dy: Math.random() * 3 - 1.5
		};
	  }
	
	  private broadcastState() {
		const message = JSON.stringify(this.state);
		for (const ws of this.connections) {
			ws.send(message);
		}
		// this.connections.forEach(ws => ws.send(message));
	  }
	
}
