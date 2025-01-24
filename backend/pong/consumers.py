import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

class GameState:
	def __init__(self):
		# Initialize game state
		self.paddle1_y = 160
		self.paddle2_y = 160
		self.ball_x = 400
		self.ball_y = 200
		self.ball_speed_x = 5
		self.ball_speed_y = 2
		self.game_width = 800
		self.game_height = 400
		self.paddle_height = 100
		self.paddle_width = 10
		self.ball_size = 20
		self.inputs = {}
		self.game_id = 1

	def update(self):
		if self.inputs:
			if self.inputs['w'] and self.paddle1_y > 0:
				
				self.paddle1_y -= 5
			if self.inputs['s'] and self.paddle1_y < self.game_height - self.paddle_height:
				self.paddle1_y += 5
			if self.inputs['ArrowUp'] and self.paddle2_y > 0:
				self.paddle2_y -= 5
			if self.inputs['ArrowDown'] and self.paddle2_y < self.game_height - self.paddle_height:
				self.paddle2_y += 5

		self.ball_x += self.ball_speed_x
		self.ball_y += self.ball_speed_y

		if self.ball_y < self.ball_size / 2 or self.ball_y > self.game_height - self.ball_size / 2:
			self.ball_speed_y = -self.ball_speed_y

		# Ball collision with paddles
		if (self.ball_x < self.paddle_width + self.ball_size / 2 and 
			self.paddle1_y < self.ball_y < self.paddle1_y + self.paddle_height):
			self.ball_speed_x = abs(self.ball_speed_x)

		if (self.ball_x > self.game_width - self.paddle_width - self.ball_size / 2 and 
			self.paddle2_y < self.ball_y < self.paddle2_y + self.paddle_height):
			self.ball_speed_x = -abs(self.ball_speed_x)

		# Reset ball if it goes past paddles
		if self.ball_x < 0 or self.ball_x > self.game_width:
			self.ball_x = self.game_width / 2
			self.ball_y = self.game_height / 2
			self.ball_speed_x = 5 if self.ball_x < 0 else -5
			self.ball_speed_y = 2

class GameConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		print("WebSocket connected")
		
		self.game = GameState()
		
		self.game_loop_task = asyncio.create_task(self.game_loop())
		await self.send_game_state()

	async def disconnect(self, close_code):
		if hasattr(self, 'game_loop_task'):
			self.game_loop_task.cancel()
			try:
				await self.game_loop_task
			except asyncio.CancelledError:
				pass

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			if data['type'] == 'game_input':
				# self.game.update(data['inputs'])
				self.game.inputs = data['inputs']
				# await self.send_game_state()
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
		}

	async def send_game_state(self):
		try:
			await self.send(text_data=json.dumps(self.game_state_to_json()))
		except Exception as e:
			print(f"Error sending game state: {str(e)}")

	async def game_loop(self):
		try:
			while True:
				self.game.update()
				await self.send_game_state()
				await asyncio.sleep(1/60)
		except asyncio.CancelledError:
			pass
		except Exception as e:
			print(f"Error in game loop: {str(e)}")
