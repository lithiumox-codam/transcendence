import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import random

import json
import asyncio
import random

class GameState:
    def __init__(self):
        # Game dimensions (normalized)
        self.game_width = 800
        self.game_height = 400

        # Initialize game state with normalized coordinates (0-1)
        self.paddle1_y = 160 / self.game_height  # 160px normalized
        self.paddle2_y = 160 / self.game_height
        self.ball_x = 400 / self.game_width
        self.ball_y = 200 / self.game_height

        # Normalized speeds (units per frame)
        self.ball_speed_x = 0.00625  # Equivalent to 5px/frame
        self.ball_speed_y = 0.005     # Equivalent to 2px/frame

        # Paddle dimensions (normalized)
        self.paddle_height = 100 / self.game_height
        self.paddle_width = 10 / self.game_width

        # Ball size (normalized)
        self.ball_size = 20 / self.game_width

        # Scores
        self.score1 = 0
        self.score2 = 0
        self.score_limit = 7

        # Inputs
        self.inputs = {}
        self.game_id = 1

    def update_paddles(self):
        if self.inputs:
            if self.inputs.get('w') and self.paddle1_y > 0:
                self.paddle1_y -= 0.003  # Adjust speed as needed
            if self.inputs.get('s') and self.paddle1_y < 1 - self.paddle_height:
                self.paddle1_y += 0.003
            if self.inputs.get('ArrowUp') and self.paddle2_y > 0:
                self.paddle2_y -= 0.003
            if self.inputs.get('ArrowDown') and self.paddle2_y < 1 - self.paddle_height:
                self.paddle2_y += 0.003

    def update_game(self):
        # Update ball position
        self.ball_x += self.ball_speed_x
        self.ball_y += self.ball_speed_y

        # Collision with top and bottom walls
        if self.ball_y <= 0 or self.ball_y >= 1:
            self.ball_speed_y = -self.ball_speed_y

        # Collision with paddles
        if (self.ball_x <= self.paddle_width + self.ball_size / 2 and 
            self.paddle1_y <= self.ball_y <= self.paddle1_y + self.paddle_height):
            self.ball_speed_x = abs(self.ball_speed_x) * 1.05  # Increase speed

        if (self.ball_x >= 1 - self.paddle_width - self.ball_size / 2 and 
            self.paddle2_y <= self.ball_y <= self.paddle2_y + self.paddle_height):
            self.ball_speed_x = -abs(self.ball_speed_x) * 1.05  # Increase speed

        # Scoring
        if self.ball_x < 0:
            self.score2 += 1
            self.reset_ball(scored_player=2)
        elif self.ball_x > 1:
            self.score1 += 1
            self.reset_ball(scored_player=1)

    def reset_ball(self, scored_player):
        self.ball_x = 0.5  # Center
        self.ball_y = 0.5
        self.ball_speed_x = 0.00625 if scored_player == 1 else -0.00625
        self.ball_speed_y = 0.005 if random.random() < 0.5 else -0.005

    def check_winner(self):
        if self.score1 >= self.score_limit:
            return 1
        elif self.score2 >= self.score_limit:
            return 2
        return None

    # def game_state_to_json(self):
    #     return {
    #         'type': 'game_state',
    #         'paddle1_y': self.paddle1_y,
    #         'paddle2_y': self.paddle2_y,
    #         'ball_x': self.ball_x,
    #         'ball_y': self.ball_y,
    #         'score1': self.score1,
    #         'score2': self.score2,
    #         'winner': self.check_winner()
    #     }
# class GameState:
# 	def __init__(self):
# 		# Initialize game state
# 		self.paddle1_y = 160
# 		self.paddle2_y = 160
# 		self.ball_x = 400
# 		self.ball_y = 200
# 		self.ball_speed_x = 5
# 		self.ball_speed_y = 2
# 		self.game_width = 800
# 		self.game_height = 400
# 		self.paddle_height = 100
# 		self.paddle_width = 10
# 		self.ball_size = 20
# 		self.inputs = {}
# 		self.game_id = 1

# 		self.score1 = 0
# 		self.score2 = 0
# 		self.score_limit = 7

# 	def update_paddles(self):
# 		if self.inputs:
# 			if self.inputs['w'] and self.paddle1_y > 0:
# 				self.paddle1_y -= 0.3
# 			if self.inputs['s'] and self.paddle1_y < self.game_height - self.paddle_height:
# 				self.paddle1_y += 0.3
# 			if self.inputs['ArrowUp'] and self.paddle2_y > 0:
# 				self.paddle2_y -= 0.3
# 			if self.inputs['ArrowDown'] and self.paddle2_y < self.game_height - self.paddle_height:
# 				self.paddle2_y += 0.3
		

# 	def update_game(self):
# 		self.ball_x += self.ball_speed_x
# 		self.ball_y += self.ball_speed_y

# 		if self.ball_y < self.ball_size / 2 or self.ball_y > self.game_height - self.ball_size / 2:
# 			self.ball_speed_y = -self.ball_speed_y

# 		# Ball collision with paddles
# 		if (self.ball_x < self.paddle_width + self.ball_size / 2 and 
# 			self.paddle1_y < self.ball_y < self.paddle1_y + self.paddle_height):
# 			self.ball_speed_x = abs(self.ball_speed_x) * 1.05

# 		if (self.ball_x > self.game_width - self.paddle_width - self.ball_size / 2 and 
# 			self.paddle2_y < self.ball_y < self.paddle2_y + self.paddle_height):
# 			self.ball_speed_x = -abs(self.ball_speed_x) * 1.05

# 		# add scoring
# 		if self.ball_x < 0:
# 			self.score2 += 1
# 			self.reset_ball(scored_player=2)
# 		elif self.ball_x > self.game_width:
# 			self.score1 += 1
# 			self.reset_ball(scored_player=1)


# 	def reset_ball(self, scored_player):
# 			self.ball_x = self.game_width / 2
# 			self.ball_y = self.game_height / 2

# 			self.ball_speed_x = 5 if scored_player == 1 else -5
# 			self.ball_speed_y = 2 if random.random() < 0.5 else -2

# 	def check_winner(self):
# 		if self.score1 >= self.score_limit:
# 			return 1
# 		elif self.score2 >= self.score_limit:
# 			return 2
# 		return None
		

class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		print("WebSocket connected to game")

		self.game = GameState()
		
		self.game_loop_task = asyncio.create_task(self.game_loop())
		print("Game state sent")
	async def disconnect(self, close_code):
		if hasattr(self, 'game_loop_task'):
			self.game_loop_task.cancel()
			try:
				await self.game_loop_task
			except asyncio.CancelledError:
				print("Game loop task cancelled")
				pass

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			if data['type'] == 'game_input':
				self.game.inputs = data['inputs']
		except Exception as e:
			print(f"Error processing message: {str(e)}")
			await self.send(text_data=json.dumps({
				'type': 'error',
				'message': str(e)
			}))

	def game_state_to_json(self):
		return {
			'type': 'game_state',
			'paddle1_y': self.game.paddle1_y,
			'paddle2_y': self.game.paddle2_y,
			'ball_x': self.game.ball_x,
			'ball_y': self.game.ball_y,
			'ball_speed_x': self.game.ball_speed_x,
			'ball_speed_y': self.game.ball_speed_y,
			'score1': self.game.score1,
			'score2': self.game.score2,
			'winner': self.game.check_winner()
		}

	async def send_game_state(self):
		try:
			await self.send(text_data=json.dumps(self.game_state_to_json()))
		except Exception as e:
			print(f"Error sending game state: {str(e)}")

	async def paddle_update_loop(self):
		while True:
			self.game.update_paddles()
			await asyncio.sleep(1/1000)
		
	async def ball_update_loop(self):
		while True:
			self.game.update_game()
			winner = self.game.check_winner()
			await self.send_game_state()
			
			if winner:
				await self.send(text_data=json.dumps({
					'type': 'game_end',
					'winner': winner
				}))
				break
			
			await asyncio.sleep(1/60)

	async def game_loop(self):
		try:
			paddle_loop = asyncio.create_task(self.paddle_update_loop())
			ball_loop = asyncio.create_task(self.ball_update_loop())

			await asyncio.gather(paddle_loop, ball_loop)
		except asyncio.CancelledError:
			pass
		except Exception as e:
			print(f"Error in game loop: {str(e)}")